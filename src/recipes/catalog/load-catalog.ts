import manifest from "@/data/generated/vanilla-recipes/manifest.json";

import type { MinecraftVersion } from "@/data/types";
import type {
  GeneratedRecipeCatalog,
  GeneratedRecipeCatalogManifest,
} from "@/recipes/catalog/types";

const recipeCatalogManifest = manifest as GeneratedRecipeCatalogManifest;

const recipeCatalogLoaders = import.meta.glob<{ default: GeneratedRecipeCatalog }>(
  "/src/data/generated/vanilla-recipes/*.json",
);

export const supportedRecipeCatalogVersions = recipeCatalogManifest.versions;
export const latestRecipeCatalogVersion = recipeCatalogManifest.latestVersion;

export function isSupportedRecipeCatalogVersion(value: unknown): value is MinecraftVersion {
  return (
    typeof value === "string" && supportedRecipeCatalogVersions.includes(value as MinecraftVersion)
  );
}

export async function loadRecipeCatalog(
  version: MinecraftVersion,
): Promise<GeneratedRecipeCatalog | undefined> {
  const loader = recipeCatalogLoaders[`/src/data/generated/vanilla-recipes/${version}.json`];

  if (!loader) {
    return undefined;
  }

  return (await loader()).default;
}
