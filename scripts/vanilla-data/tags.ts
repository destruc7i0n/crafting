import { mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";

import { versions } from "minecraft-textures";

import { type TagGraph, resolveTagGraph, toTagRef } from "@/lib/tags";

import { getSummaryCommitForVersion, readMcmetaJson } from "./mcmeta-repo";

const repoRoot = path.resolve(import.meta.dirname, "../..");
const outputDir = path.join(repoRoot, "src/data/generated/vanilla-tags");
const summaryTagFilePath = "data/tag/item/data.min.json";

type SummaryTagValue = string | { id: string };
type SummaryTagEntry = {
  values?: SummaryTagValue[];
};
type SummaryTagFile = Record<string, SummaryTagEntry>;

const versionsWithoutVanillaTags = new Set(["1.12", "1.13"]);
const versionsWithVanillaTags = versions.filter(
  (version) => !versionsWithoutVanillaTags.has(version),
);

export async function generateJavaVanillaTags(gitDir: string): Promise<void> {
  console.log(
    `Starting Java vanilla tag generation for ${versionsWithVanillaTags.length} versions`,
  );

  await prepareOutputDir();

  await Promise.all(
    versionsWithVanillaTags.map(async (version, index) => {
      console.log(
        `Generating Java vanilla item tags for ${version} (${index + 1}/${versionsWithVanillaTags.length})`,
      );

      const sha = await getSummaryCommitForVersion(gitDir, version);
      if (!sha) {
        throw new Error(`No mcmeta summary commit found for version ${version}`);
      }

      const rawTags = await readRawTagsForCommit(gitDir, sha);
      const resolvedTags = resolveTagGraph(rawTags);

      await writeVersionTags(version, resolvedTags);
    }),
  );
}

async function prepareOutputDir(): Promise<void> {
  console.log(`Preparing tag output directory at ${outputDir}`);

  await mkdir(outputDir, { recursive: true });

  const entries = await readdir(outputDir, { withFileTypes: true });
  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => rm(path.join(outputDir, entry.name), { force: true })),
  );
}

async function readRawTagsForCommit(
  gitDir: string,
  sha: string,
): Promise<Record<string, string[]>> {
  const data = await readMcmetaJson<SummaryTagFile>(gitDir, sha, summaryTagFilePath);

  return Object.fromEntries(
    Object.entries(data).map(([tagName, entry]) => [
      `minecraft:${tagName}`,
      getTagValues(entry).map(normalizeTagValue),
    ]),
  );
}

async function writeVersionTags(version: string, tags: TagGraph): Promise<void> {
  await Bun.write(path.join(outputDir, `${version}.json`), `${JSON.stringify(tags, null, 2)}\n`);
}

function getTagValues(entry: SummaryTagEntry): string[] {
  if (!Array.isArray(entry.values)) {
    return [];
  }

  return entry.values.map(getTagValueId).filter((value): value is string => value !== null);
}

function getTagValueId(value: SummaryTagValue): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value.id === "string") {
    return value.id;
  }

  return null;
}

function normalizeTagValue(value: string): string {
  return value.startsWith("#") && !value.includes(":")
    ? toTagRef(`minecraft:${value.slice(1)}`)
    : value;
}
