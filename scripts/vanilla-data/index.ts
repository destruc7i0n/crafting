import { latestVersion, versions } from "minecraft-textures";

import { MinecraftVersion } from "@/data/types";

import { fetchBedrockTags } from "./bedrock-tags";
import { cleanupMcmetaRepo, cloneMcmetaRepo } from "./mcmeta-repo";
import { generateJavaRecipeCatalogs } from "./recipes";
import { generateJavaVanillaTags, writeVanillaTagsManifest } from "./tags";

if (latestVersion !== versions.at(-1)) {
  throw new Error("minecraft-textures latestVersion did not match the final versions entry");
}

console.time("generate:vanilla-data");

const gitDir = await cloneMcmetaRepo();

try {
  const generatedJavaTagVersions = await generateJavaVanillaTags(gitDir);
  await fetchBedrockTags();
  await writeVanillaTagsManifest([MinecraftVersion.Bedrock, ...generatedJavaTagVersions]);
  await generateJavaRecipeCatalogs(gitDir);
} finally {
  await cleanupMcmetaRepo(gitDir);
  console.timeEnd("generate:vanilla-data");
}
