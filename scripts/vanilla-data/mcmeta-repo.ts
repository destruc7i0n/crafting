import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { $ } from "bun";

const mcmetaRepoUrl = "https://github.com/misode/mcmeta.git";

export async function cloneMcmetaRepo(): Promise<string> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "crafting-vanilla-data-"));
  const gitDir = path.join(tempDir, "mcmeta.git");

  console.log(`Cloning mcmeta into ${gitDir}`);

  try {
    await $`git clone --bare --filter=blob:none ${mcmetaRepoUrl} ${gitDir}`.quiet();
  } catch {
    await rm(tempDir, { recursive: true, force: true });
    throw new Error("Failed to clone mcmeta repo");
  }

  return gitDir;
}

export async function cleanupMcmetaRepo(gitDir: string): Promise<void> {
  console.log("Cleaning up temporary mcmeta clone");
  await rm(path.dirname(gitDir), { recursive: true, force: true });
}

export async function resolveMcmetaRef(gitDir: string, ref: string): Promise<string> {
  const candidates = [ref, `refs/heads/${ref}`, `refs/tags/${ref}`];

  for (const candidate of candidates) {
    try {
      const resolved = await $`git --git-dir=${gitDir} rev-parse --verify ${candidate}`.text();
      return resolved.trim();
    } catch {
      // Try the next candidate.
    }
  }

  throw new Error(`Could not resolve mcmeta ref ${ref}`);
}

export async function listMcmetaFiles(
  gitDir: string,
  ref: string,
  prefix: string,
): Promise<string[]> {
  const resolvedRef = await resolveMcmetaRef(gitDir, ref);
  const output =
    await $`git --git-dir=${gitDir} ls-tree -r --name-only ${resolvedRef} ${prefix}`.text();

  return output
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.endsWith(".json"));
}

export async function exportMcmetaTree(
  gitDir: string,
  ref: string,
  prefix: string,
): Promise<string> {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "crafting-mcmeta-tree-"));
  const resolvedRef = await resolveMcmetaRef(gitDir, ref);

  try {
    await $`git --git-dir=${gitDir} archive --format=tar ${resolvedRef} ${prefix} | tar -xf - -C ${tempDir}`.quiet();
  } catch {
    await rm(tempDir, { recursive: true, force: true });
    throw new Error(`Failed to export mcmeta tree ${ref}:${prefix}`);
  }

  return tempDir;
}

export async function readMcmetaJson<T>(gitDir: string, ref: string, filePath: string): Promise<T> {
  const resolvedRef = await resolveMcmetaRef(gitDir, ref);
  return (await $`git --git-dir=${gitDir} show ${resolvedRef}:${filePath}`.json()) as T;
}

export async function getSummaryCommitForVersion(
  gitDir: string,
  version: string,
): Promise<string | null> {
  const escapedVersion = version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const sha =
    await $`git --git-dir=${gitDir} log -1 --format=%H --grep=${`Update summary for ${escapedVersion}$`} summary`.text();

  return sha.trim() || null;
}
