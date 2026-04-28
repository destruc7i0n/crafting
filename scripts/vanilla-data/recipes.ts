import { mkdir, readdir, readFile, rm } from "node:fs/promises";
import path from "node:path";

import { javaMinecraftVersions } from "@/data/constants";
import { MinecraftVersion } from "@/data/types";
import { getJavaPackMetadata } from "@/versioning";

import type {
  GeneratedRecipeCatalog,
  GeneratedRecipeCatalogEntry,
  GeneratedRecipeCatalogManifest,
} from "@/recipes/catalog/types";

import { exportMcmetaTree } from "./mcmeta-repo";
import { buildRecipeCatalogEntry } from "./recipe-handlers";
import { compareRecipeCatalogEntries } from "./recipe-order";

import type { ItemGroupOrder } from "./item-group-order";

const repoRoot = path.resolve(import.meta.dirname, "../..");
const outputDir = path.join(repoRoot, "src/data/generated/vanilla-recipes");
const versionsWithoutRecipeCatalog = new Set<MinecraftVersion>([
  MinecraftVersion.V112,
  MinecraftVersion.V113,
]);

const recipeCatalogVersions = javaMinecraftVersions.filter(
  (version) => !versionsWithoutRecipeCatalog.has(version),
);

export async function generateJavaRecipeCatalogs(
  gitDir: string,
  itemGroupOrder: ItemGroupOrder,
): Promise<void> {
  console.log(
    `Starting Java recipe catalog generation for ${recipeCatalogVersions.length} versions`,
  );

  await prepareOutputDir();

  for (const [index, version] of recipeCatalogVersions.entries()) {
    console.log(
      `Generating Java recipe catalog for ${version} (${index + 1}/${recipeCatalogVersions.length})`,
    );

    await generateJavaRecipeCatalog(gitDir, version, itemGroupOrder);
  }

  await writeRecipeCatalogManifest();
}

async function prepareOutputDir(): Promise<void> {
  console.log(`Preparing recipe output directory at ${outputDir}`);

  await mkdir(outputDir, { recursive: true });

  const entries = await readdir(outputDir, { withFileTypes: true });
  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => rm(path.join(outputDir, entry.name), { force: true })),
  );
}

async function generateJavaRecipeCatalog(
  gitDir: string,
  version: Exclude<MinecraftVersion, MinecraftVersion.Bedrock>,
  itemGroupOrder: ItemGroupOrder,
): Promise<void> {
  const metadata = getJavaPackMetadata(version);
  const ref = `${version}-data-json`;
  const prefix = `data/minecraft/${metadata.recipeDir}/`;
  const treeDir = await exportMcmetaTree(gitDir, ref, prefix);

  try {
    const recipeDir = path.join(treeDir, prefix);
    const files = await listJsonFiles(recipeDir);
    const recipes = await Promise.all(
      files.map(async (filePath) => {
        const recipe = JSON.parse(await readFile(filePath, "utf8")) as unknown;
        const repoPath = toRepoPath(treeDir, filePath);
        const id = toRecipeId(prefix, repoPath);

        return buildRecipeCatalogEntry({ id, recipe });
      }),
    );

    const catalog = recipes
      .filter((entry): entry is GeneratedRecipeCatalogEntry => entry !== null)
      .sort((a, b) =>
        compareRecipeCatalogEntries(itemGroupOrder, a, b),
      ) satisfies GeneratedRecipeCatalog;

    console.log(`Rendered ${catalog.length}/${files.length} recipes for ${version}`);

    await Bun.write(
      path.join(outputDir, `${version}.json`),
      `${JSON.stringify(catalog, null, 2)}\n`,
    );
  } finally {
    await rm(treeDir, { recursive: true, force: true });
  }
}

async function writeRecipeCatalogManifest(): Promise<void> {
  const manifest = {
    versions: [...recipeCatalogVersions],
    latestVersion: recipeCatalogVersions[0],
  } satisfies GeneratedRecipeCatalogManifest;

  await Bun.write(path.join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
}

function toRecipeId(prefix: string, filePath: string): string {
  const relativePath = filePath.slice(prefix.length, -".json".length);
  return `minecraft:${relativePath}`;
}

async function listJsonFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return listJsonFiles(entryPath);
      }

      return entry.isFile() && entry.name.endsWith(".json") ? [entryPath] : [];
    }),
  );

  return files.flat();
}

function toRepoPath(treeDir: string, filePath: string): string {
  return path.relative(treeDir, filePath).split(path.sep).join("/");
}
