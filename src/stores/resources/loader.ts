import potionManifest from "minecraft-textures/manifest/potions/index.json";

import type { TexturesType } from "minecraft-textures";

import { getOrdinaryTextureVersion, minecraftTextureAssetPath } from "@/data/constants";
import manifest from "@/data/generated/vanilla-tags/manifest.json";
import {
  getRawId,
  identifierUniqueKey,
  parseStringToMinecraftIdentifier,
} from "@/data/models/identifier/utilities";
import { transformMinecraftTexturesItem } from "@/data/models/item/utilities";
import { Item } from "@/data/models/types";
import {
  createPotionCatalog,
  newestBedrockPotionVersion,
  potionAssetBasePath,
  selectPotionVersion,
  type PotionCatalogFile,
} from "@/data/potions";
import { MinecraftVersion } from "@/data/types";
import { resolveItemId } from "@/lib/resolve-item-id";
import { useResourcesStore } from "@/stores/resources";

type GeneratedVanillaTagsManifest = {
  versions: MinecraftVersion[];
};

const vanillaTagsManifest = manifest as GeneratedVanillaTagsManifest;
const supportedVanillaTagVersions = new Set(vanillaTagsManifest.versions);
const minecraftTextureAssetBaseUrl = `${import.meta.env.BASE_URL}${minecraftTextureAssetPath}`;

function resolveMinecraftTextureUrl(texture: string): string {
  return `${minecraftTextureAssetBaseUrl}${texture}`;
}

const textureLoaders = import.meta.glob<{ default: TexturesType }>(
  "/node_modules/minecraft-textures/dist/textures/manifest/[0-9]*[0-9].json",
);
const tagLoaders = import.meta.glob<{ default: Record<string, string[]> }>([
  "/src/data/generated/vanilla-tags/*.json",
  "!/src/data/generated/vanilla-tags/manifest.json",
]);
const potionUrls = import.meta.glob<string>(
  "/node_modules/minecraft-textures/dist/textures/manifest/potions/[0-9]*.json",
  { eager: true, query: "?url", import: "default" },
);
const potionVersions = (potionManifest as { versions: string[] }).versions;

export function getPotionCatalogSourceVersion(version: MinecraftVersion): string | undefined {
  return version === MinecraftVersion.Bedrock
    ? newestBedrockPotionVersion(potionVersions)
    : selectPotionVersion(version, potionVersions);
}

// track in-flight loads - prevents double-fetch
const loadingVersions = new Set<MinecraftVersion>();

async function fetchResourcesForVersion(version: MinecraftVersion): Promise<void> {
  const textureVersion = getOrdinaryTextureVersion(version);
  const texturePath = `/node_modules/minecraft-textures/dist/textures/manifest/${textureVersion}.json`;

  const loadTextureModule = textureLoaders[texturePath];

  if (!loadTextureModule) {
    throw new Error(`No texture manifest found for Minecraft version ${textureVersion}`);
  }

  const module = (await loadTextureModule()).default;
  const mcTexturesItems = module.items.map((item) => ({
    ...item,
    texture: resolveMinecraftTextureUrl(item.texture),
  }));
  let vanillaTags: Record<string, string[]> = {};

  const tagPath =
    version === MinecraftVersion.Bedrock
      ? `/src/data/generated/vanilla-tags/bedrock.json`
      : `/src/data/generated/vanilla-tags/${version}.json`;
  const loadTagModule = supportedVanillaTagVersions.has(version) ? tagLoaders[tagPath] : undefined;
  if (loadTagModule) {
    vanillaTags = (await loadTagModule()).default;
  }

  const items: Item[] = [];
  const itemsById: Record<string, Item> = {};

  for (const mcTexturesItem of mcTexturesItems) {
    const item = transformMinecraftTexturesItem(mcTexturesItem, version);

    const resolved = resolveItemId(mcTexturesItem.id, version);
    if (resolved === null) continue;
    item.id = {
      ...parseStringToMinecraftIdentifier(resolved.id),
      ...(resolved.data !== undefined ? { data: resolved.data } : {}),
    };

    const key = identifierUniqueKey(item.id);
    if (!itemsById[key]) {
      items.push(item);
      itemsById[key] = item;
    }

    // for bedrock items with data values (e.g. minecraft:banner:0)
    // also index under the plain ID so tag values (e.g. "minecraft:banner") resolve correctly.
    if (item.id.data !== undefined) {
      const plainKey = getRawId(item.id);
      if (!itemsById[plainKey]) {
        itemsById[plainKey] = item;
      }
    }
  }

  useResourcesStore.getState().setResourceData(version, { items, itemsById, vanillaTags });
}

export function loadResources(version: MinecraftVersion): void {
  if (useResourcesStore.getState()[version] || loadingVersions.has(version)) return;
  loadingVersions.add(version);
  fetchResourcesForVersion(version).catch((error) => {
    loadingVersions.delete(version);
    console.error(error);
  });
}

const loadingPotionVersions = new Set<string>();

async function fetchPotionsForVersion(version: MinecraftVersion): Promise<void> {
  const sourceVersion = getPotionCatalogSourceVersion(version);
  if (!sourceVersion) throw new Error(`No potion catalog found for Minecraft version ${version}`);
  const path = `/node_modules/minecraft-textures/dist/textures/manifest/potions/${sourceVersion}.json`;
  const url = potionUrls[path];
  if (!url) throw new Error(`No potion manifest found for Minecraft version ${sourceVersion}`);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load potion catalog (${response.status})`);
  const file = (await response.json()) as PotionCatalogFile;
  useResourcesStore.getState().setPotionState(sourceVersion, {
    status: "ready",
    catalog: createPotionCatalog(file, potionAssetBasePath),
  });
}

export function loadPotions(version: MinecraftVersion, retry = false): void {
  const sourceVersion = getPotionCatalogSourceVersion(version);
  if (!sourceVersion) return;
  const state = useResourcesStore.getState().potionCatalogs[sourceVersion];
  if (
    (!retry && (state?.status === "loading" || state?.status === "ready")) ||
    loadingPotionVersions.has(sourceVersion)
  )
    return;
  loadingPotionVersions.add(sourceVersion);
  useResourcesStore.getState().setPotionState(sourceVersion, { status: "loading" });
  fetchPotionsForVersion(version)
    .catch((error: unknown) => {
      useResourcesStore.getState().setPotionState(sourceVersion, {
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      });
    })
    .finally(() => loadingPotionVersions.delete(sourceVersion));
}

export const retryPotions = (version: MinecraftVersion): void => loadPotions(version, true);
