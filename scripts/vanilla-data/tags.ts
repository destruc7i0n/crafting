import { mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";

import { javaMinecraftVersions } from "@/data/constants";
import { MinecraftVersion } from "@/data/types";
import { type TagGraph, resolveTagGraph, toTagRef } from "@/lib/tags";

import { getSummaryCommitForVersion, tryReadMcmetaJson } from "./mcmeta-repo";

const repoRoot = path.resolve(import.meta.dirname, "../..");
const outputDir = path.join(repoRoot, "src/data/generated/vanilla-tags");
const summaryTagFilePath = "data/tag/item/data.min.json";

type SummaryTagValue = string | { id: string };
type SummaryTagEntry = {
  values?: SummaryTagValue[];
};
type SummaryTagFile = Record<string, SummaryTagEntry>;
type GeneratedVanillaTagsManifest = {
  versions: MinecraftVersion[];
};

export async function generateJavaVanillaTags(gitDir: string): Promise<MinecraftVersion[]> {
  console.log(`Starting Java vanilla tag generation for ${javaMinecraftVersions.length} versions`);

  await prepareOutputDir();

  const generatedVersions = await Promise.all(
    javaMinecraftVersions.map(async (version, index): Promise<MinecraftVersion | null> => {
      console.log(
        `Checking Java vanilla item tags for ${version} (${index + 1}/${javaMinecraftVersions.length})`,
      );

      const sha = await getSummaryCommitForVersion(gitDir, version);
      if (!sha) {
        console.log(`Skipping Java vanilla item tags for ${version}: no mcmeta summary commit`);
        return null;
      }

      const rawTags = await readRawTagsForCommit(gitDir, sha);
      if (!rawTags) {
        console.log(`Skipping Java vanilla item tags for ${version}: no item tag summary`);
        return null;
      }

      const resolvedTags = resolveTagGraph(rawTags);

      await writeVersionTags(version, resolvedTags);
      return version;
    }),
  );

  return generatedVersions.filter((version): version is MinecraftVersion => version !== null);
}

export async function writeVanillaTagsManifest(versions: MinecraftVersion[]): Promise<void> {
  const manifest = {
    versions: [...versions],
  } satisfies GeneratedVanillaTagsManifest;

  await Bun.write(path.join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
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
): Promise<Record<string, string[]> | undefined> {
  const data = await tryReadMcmetaJson<SummaryTagFile>(gitDir, sha, summaryTagFilePath);

  if (!data) {
    return undefined;
  }

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
