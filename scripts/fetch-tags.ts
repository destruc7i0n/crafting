import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const outputPath = path.join(repoRoot, "src/data/generated/tags.json");
const minecraftTexturesPath = path.join(
  repoRoot,
  "node_modules/minecraft-textures/dist/textures/json",
);

const archiveUrl = "https://codeload.github.com/misode/mcmeta/zip/refs/heads/data-json";

const minecraftTexturesModule = (await import("minecraft-textures")) as Record<string, unknown>;
const defaultExport = (minecraftTexturesModule.default ?? minecraftTexturesModule) as Record<
  string,
  unknown
>;
const versions = (defaultExport.versions ?? minecraftTexturesModule.versions) as string[];
const latestVersion = (defaultExport.latestVersion ??
  minecraftTexturesModule.latestVersion) as string;

if (!Array.isArray(versions) || versions.length === 0) {
  throw new Error("Unable to read minecraft-textures versions");
}

if (latestVersion !== versions.at(-1)) {
  throw new Error("minecraft-textures latestVersion did not match the final versions entry");
}

const readItemIdsForVersion = async (version: string): Promise<Set<string>> => {
  const json = await Bun.file(path.join(minecraftTexturesPath, `${version}.id.json`)).json();
  return new Set(Object.keys(json.items ?? {}));
};

const downloadAndExtractTags = async (): Promise<Record<string, string[]>> => {
  const response = await fetch(archiveUrl);
  if (!response.ok) {
    throw new Error(`Failed to download mcmeta archive: ${response.status} ${response.statusText}`);
  }

  const tempDir = await mkdtemp(path.join(os.tmpdir(), "crafting-tags-"));
  const zipPath = path.join(tempDir, "mcmeta.zip");

  try {
    await Bun.write(zipPath, response);

    const list = Bun.spawnSync(["unzip", "-Z1", zipPath], { stdout: "pipe" });
    const tagFilePaths = list.stdout
      .toString()
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("mcmeta-data-json/data/minecraft/tags/item/"))
      .filter((line) => line.endsWith(".json"));

    const entries = await Promise.all(
      tagFilePaths.map(async (tagFilePath) => {
        const extract = Bun.spawnSync(["unzip", "-p", zipPath, tagFilePath], { stdout: "pipe" });
        const json = JSON.parse(extract.stdout.toString());
        const tagId = `minecraft:${path.basename(tagFilePath, ".json")}`;

        return [
          tagId,
          Array.isArray(json.values)
            ? json.values.filter((value: unknown) => typeof value === "string")
            : [],
        ] as [string, string[]];
      }),
    );

    return Object.fromEntries(entries);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
};

const resolveTagMap = (rawTags: Record<string, string[]>): Record<string, string[]> => {
  const cache = new Map<string, string[]>();

  const resolve = (tagId: string, ancestry = new Set<string>()): string[] => {
    if (cache.has(tagId)) {
      return cache.get(tagId)!;
    }

    if (ancestry.has(tagId)) {
      return [];
    }

    const nextAncestry = new Set(ancestry);
    nextAncestry.add(tagId);

    const resolved: string[] = [];
    for (const value of rawTags[tagId] ?? []) {
      if (value.startsWith("#")) {
        resolved.push(...resolve(value.slice(1), nextAncestry));
      } else {
        resolved.push(value);
      }
    }

    const uniqueValues = [...new Set(resolved)];
    cache.set(tagId, uniqueValues);
    return uniqueValues;
  };

  return Object.fromEntries(
    Object.keys(rawTags)
      .sort((left, right) => left.localeCompare(right))
      .map((tagId) => [tagId, resolve(tagId)]),
  );
};

const buildVersionedTagMap = async (): Promise<Record<string, Record<string, string[]>>> => {
  const rawTags = await downloadAndExtractTags();
  const resolvedTags = resolveTagMap(rawTags);

  const versionEntries = await Promise.all(
    versions.map(async (version) => {
      if (version === "1.12") {
        return [version, {}] as [string, Record<string, string[]>];
      }

      const itemIds = await readItemIdsForVersion(version);
      const filteredTags = Object.fromEntries(
        Object.entries(resolvedTags)
          .map(([tagId, values]) => [tagId, values.filter((value) => itemIds.has(value))])
          .filter(([, values]) => (values as string[]).length > 0),
      );

      return [version, filteredTags] as [string, Record<string, string[]>];
    }),
  );

  return Object.fromEntries(versionEntries);
};

const tagMap = await buildVersionedTagMap();

await Bun.write(outputPath, `${JSON.stringify(tagMap, null, 2)}\n`);

console.log(
  `Generated vanilla item tags for ${versions.length} versions through ${latestVersion} at ${path.relative(repoRoot, outputPath)}`,
);
