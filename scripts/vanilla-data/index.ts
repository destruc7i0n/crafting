import { latestVersion, versions } from "minecraft-textures";

import { fetchBedrockTags } from "./bedrock-tags";
import { loadItemGroupOrder } from "./item-group-order";
import { cleanupMcmetaRepo, cloneMcmetaRepo } from "./mcmeta-repo";
import { generateJavaRecipeCatalogs } from "./recipes";
import { generateJavaVanillaTags } from "./tags";

if (latestVersion !== versions.at(-1)) {
  throw new Error("minecraft-textures latestVersion did not match the final versions entry");
}

console.time("generate:vanilla-data");

const gitDir = await cloneMcmetaRepo();

try {
  const itemGroupOrder = await loadItemGroupOrder();

  await generateJavaVanillaTags(gitDir);
  await fetchBedrockTags();
  await generateJavaRecipeCatalogs(gitDir, itemGroupOrder);
} finally {
  await cleanupMcmetaRepo(gitDir);
  console.timeEnd("generate:vanilla-data");
}
