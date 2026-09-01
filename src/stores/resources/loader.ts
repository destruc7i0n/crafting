import type { TexturesType } from "minecraft-textures";

import { latestMinecraftVersion, minecraftTextureAssetPath } from "@/data/constants";
import manifest from "@/data/generated/vanilla-tags/manifest.json";
import {
  getRawId,
  identifierUniqueKey,
  parseStringToMinecraftIdentifier,
} from "@/data/models/identifier/utilities";
import { transformMinecraftTexturesItem } from "@/data/models/item/utilities";
import { Item } from "@/data/models/types";
import { MinecraftVersion } from "@/data/types";
import { resolveItemId } from "@/lib/resolve-item-id";
import { VersionResourceData, useResourcesStore } from "@/stores/resources";

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

// track in-flight loads - prevents double-fetch
const inFlightLoads = new Map<MinecraftVersion, Promise<VersionResourceData>>();

async function fetchResourcesForVersion(version: MinecraftVersion): Promise<VersionResourceData> {
  const textureVersion = version === MinecraftVersion.Bedrock ? latestMinecraftVersion : version;
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

  const data: VersionResourceData = { items, itemsById, vanillaTags };
  useResourcesStore.getState().setResourceData(version, data);

  return data;
}

/**
 * Resolves with the resources for a version, loading them if needed.
 * Concurrent calls for the same version share a single fetch; failed loads can be retried.
 */
export function ensureResources(version: MinecraftVersion): Promise<VersionResourceData> {
  const loaded = useResourcesStore.getState()[version];
  if (loaded) return Promise.resolve(loaded);

  const inFlight = inFlightLoads.get(version);
  if (inFlight) return inFlight;

  const load = fetchResourcesForVersion(version).finally(() => {
    // the store holds the data on success; on failure, clearing allows a retry
    inFlightLoads.delete(version);
  });
  inFlightLoads.set(version, load);

  return load;
}

export function loadResources(version: MinecraftVersion): void {
  void ensureResources(version).catch(console.error);
}
