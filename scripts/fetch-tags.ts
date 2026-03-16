import { mkdir, mkdtemp, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { $ } from "bun";
import { latestVersion, versions } from "minecraft-textures";

const repoRoot = path.resolve(import.meta.dirname, "..");
const outputDir = path.join(repoRoot, "src/data/generated/vanilla-tags");
const summaryRepoUrl = "https://github.com/misode/mcmeta.git";
const summaryTagFilePath = "data/tag/item/data.min.json";

type SummaryTagValue = string | { id: string };
type SummaryTagEntry = {
  values?: SummaryTagValue[];
};
type SummaryTagFile = Record<string, SummaryTagEntry>;
type TagGraph = Record<string, string[]>;

if (latestVersion !== versions.at(-1)) {
  throw new Error("minecraft-textures latestVersion did not match the final versions entry");
}

const versionsWithoutVanillaTags = new Set(["1.12", "1.13"]);
const versionsWithVanillaTags = versions.filter(
  (version) => !versionsWithoutVanillaTags.has(version),
);

// pull a string id out of one raw tag value
const getTagValueId = (value: SummaryTagValue): string | null => {
  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string"
  ) {
    return value.id;
  }

  return null;
};

// normalize one raw tag entry into string ids
const getTagValues = (entry: SummaryTagEntry): string[] =>
  Array.isArray(entry.values)
    ? entry.values.map(getTagValueId).filter((value): value is string => value !== null)
    : [];

// escape regex characters (like .)
const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// clone the summary branch into a temporary bare repo
const cloneSummaryRepo = async (): Promise<string> => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "crafting-tags-"));
  const gitDir = path.join(tempDir, "mcmeta.git");

  console.log(`Cloning mcmeta summary branch into ${gitDir}`);

  try {
    await $`git clone --bare --single-branch --branch summary --filter=blob:none ${summaryRepoUrl} ${gitDir}`.quiet();
  } catch {
    await rm(tempDir, { recursive: true, force: true });
    throw new Error("Failed to clone mcmeta summary repo");
  }

  return gitDir;
};

// find the exact summary commit for one Minecraft version
const getCommitShaForVersion = async (gitDir: string, version: string): Promise<string | null> => {
  const escapedVersion = escapeRegex(version);
  const sha =
    await $`git --git-dir=${gitDir} log -1 --format=%H --grep=${`Update summary for ${escapedVersion}$`} summary`.text();
  return sha.trim() || null;
};

// read one version's raw tag graph from mcmeta
const readRawTagsForCommit = async (gitDir: string, sha: string): Promise<TagGraph> => {
  const data =
    (await $`git --git-dir=${gitDir} show ${sha}:${summaryTagFilePath}`.json()) as SummaryTagFile;

  return Object.fromEntries(
    Object.entries(data).map(([tagName, entry]) => [`minecraft:${tagName}`, getTagValues(entry)]),
  );
};

// normalize #tag references into full tag ids
const normalizeReferencedTagId = (value: string): string => {
  const tagId = value.slice(1);
  return tagId.includes(":") ? tagId : `minecraft:${tagId}`;
};

// resolve the tag graph and nested tags into a single flat list
const resolveTagGraph = (graph: TagGraph): TagGraph => {
  const memo = new Map<string, string[]>();

  const dfs = (nodeId: string, visited = new Set<string>()): string[] => {
    const cachedValues = memo.get(nodeId);
    if (cachedValues) {
      return cachedValues;
    }

    if (visited.has(nodeId)) {
      return [];
    }

    const nextStack = new Set(visited);
    nextStack.add(nodeId);

    const neighbors = graph[nodeId] ?? [];
    const flattenedValues = neighbors.flatMap((neighbor) => {
      if (!neighbor.startsWith("#")) {
        return [neighbor];
      }

      const referencedNodeId = normalizeReferencedTagId(neighbor);
      return dfs(referencedNodeId, nextStack);
    });

    const uniqueValues = [...new Set(flattenedValues)];
    memo.set(nodeId, uniqueValues);
    return uniqueValues;
  };

  const sortedNodeIds = Object.keys(graph).sort((left, right) => left.localeCompare(right));

  return Object.fromEntries(sortedNodeIds.map((nodeId) => [nodeId, dfs(nodeId)]));
};

const writeVersionTags = async (version: string, tags: TagGraph) => {
  await Bun.write(path.join(outputDir, `${version}.json`), `${JSON.stringify(tags, null, 2)}\n`);
};

const prepareOutputDir = async () => {
  console.log(`Preparing output directory at ${outputDir}`);

  await mkdir(outputDir, { recursive: true });

  const entries = await readdir(outputDir, { withFileTypes: true });
  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => rm(path.join(outputDir, entry.name), { force: true })),
  );
};

const generateVersionedTagFiles = async () => {
  console.log(`Starting vanilla tag generation for ${versionsWithVanillaTags.length} versions`);

  await prepareOutputDir();

  const gitDir = await cloneSummaryRepo();

  try {
    for (const [index, version] of versionsWithVanillaTags.entries()) {
      console.log(
        `Generating vanilla item tags for ${version} (${index + 1}/${versionsWithVanillaTags.length})`,
      );

      const sha = await getCommitShaForVersion(gitDir, version);
      if (!sha) {
        throw new Error(`No mcmeta summary commit found for version ${version}`);
      }

      const rawTags = await readRawTagsForCommit(gitDir, sha);
      const resolvedTags = resolveTagGraph(rawTags);

      await writeVersionTags(version, resolvedTags);
    }
  } finally {
    console.log("Cleaning up temporary mcmeta clone");
    await rm(path.dirname(gitDir), { recursive: true, force: true });
  }
};

await generateVersionedTagFiles();

console.log(`Generated vanilla item tags in ${path.relative(repoRoot, outputDir)}`);
