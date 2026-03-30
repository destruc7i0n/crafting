// Tag data sourced from misode/mcmeta
// https://github.com/misode/mcmeta

import { mkdir, mkdtemp, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { $ } from "bun";
import { latestVersion, versions } from "minecraft-textures";

import { type TagGraph, resolveTagGraph, toTagRef } from "@/lib/tags";

const repoRoot = path.resolve(import.meta.dirname, "..");
const outputDir = path.join(repoRoot, "src/data/generated/vanilla-tags");
const summaryRepoUrl = "https://github.com/misode/mcmeta.git";
const summaryTagFilePath = "data/tag/item/data.min.json";

type SummaryTagValue = string | { id: string };
type SummaryTagEntry = {
  values?: SummaryTagValue[];
};
type SummaryTagFile = Record<string, SummaryTagEntry>;

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

// normalize bare #tag references to #minecraft:tag at construction time
const normalizeValue = (v: string) =>
  v.startsWith("#") && !v.includes(":") ? toTagRef(`minecraft:${v.slice(1)}`) : v;

// read one version's raw tag graph from mcmeta
const readRawTagsForCommit = async (
  gitDir: string,
  sha: string,
): Promise<Record<string, string[]>> => {
  const data =
    (await $`git --git-dir=${gitDir} show ${sha}:${summaryTagFilePath}`.json()) as SummaryTagFile;

  return Object.fromEntries(
    Object.entries(data).map(([tagName, entry]) => [
      `minecraft:${tagName}`,
      getTagValues(entry).map(normalizeValue),
    ]),
  );
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
    await Promise.all(
      versionsWithVanillaTags.map(async (version, index) => {
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
      }),
    );
  } finally {
    console.log("Cleaning up temporary mcmeta clone");
    await rm(path.dirname(gitDir), { recursive: true, force: true });
  }
};

const fetchBedrockTags = async () => {
  console.log("Fetching Bedrock vanilla item tags");
  const url =
    "https://raw.githubusercontent.com/bedrock-dot-dev/vanilla-tags/refs/heads/main/stable/items.json";
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch Bedrock tags: ${response.statusText}`);
  const tags = await response.json();
  await Bun.write(path.join(outputDir, "bedrock.json"), `${JSON.stringify(tags, null, 2)}\n`);
};

await generateVersionedTagFiles();
await fetchBedrockTags();

console.log(`Generated vanilla item tags in ${path.relative(repoRoot, outputDir)}`);
