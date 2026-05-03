import { latestMinecraftVersion } from "@/data/constants";
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
import { useResourcesStore } from "@/stores/resources";

type GeneratedVanillaTagsManifest = {
  versions: MinecraftVersion[];
};

type TextureManifestType = {
  comment: string;
  version: string;
  items: TextureManifestItem[];
};

type TextureManifestItem = {
  id: string;
  readable: string;
  texture: string;
};

const vanillaTagsManifest = manifest as GeneratedVanillaTagsManifest;
const supportedVanillaTagVersions = new Set(vanillaTagsManifest.versions);
const minecraftTextureAssetBaseUrl = `${import.meta.env.BASE_URL}assets/textures/`;

function resolveMinecraftTextureUrl(texture: string): string {
  return `${minecraftTextureAssetBaseUrl}${texture}`;
}

const textureLoaders = import.meta.glob<{ default: TextureManifestType }>(
  "/node_modules/minecraft-textures/dist/textures/manifest/[0-9]*[0-9].json",
);
const tagLoaders = import.meta.glob<{ default: Record<string, string[]> }>([
  "/src/data/generated/vanilla-tags/*.json",
  "!/src/data/generated/vanilla-tags/manifest.json",
]);

// track in-flight loads - prevents double-fetch
const loadingVersions = new Set<MinecraftVersion>();

async function fetchResourcesForVersion(version: MinecraftVersion): Promise<void> {
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
