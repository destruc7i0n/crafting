import type { Potion as MinecraftTexturePotion } from "minecraft-textures/dist/lib/types";

import { resolveItemId, resolveBedrockPotionItem } from "@/lib/resolve-item-id";

import { compareMinecraftVersions } from "../versioning";
import { minecraftTextureAssetPath } from "./constants";
import { MinecraftVersion } from "./types";

export type Potion = MinecraftTexturePotion;

export type PotionCatalog = {
  version: string;
  items: readonly Potion[];
  javaByKey: Readonly<Record<string, Potion>>;
  bedrockByKey: Readonly<Record<string, Potion>>;
};

export type PotionCatalogFile = { version: string; items: Potion[] };

export const getPotionKey = (id: string, potion?: string): string => `${id}|${potion ?? ""}`;

export function createPotionCatalog(file: PotionCatalogFile, assetBaseUrl = ""): PotionCatalog {
  const items = file.items.map((item) => ({
    ...item,
    texture: `${assetBaseUrl}${item.texture}`,
  }));
  const javaByKey: Record<string, Potion> = {};
  const bedrockByKey: Record<string, Potion> = {};
  for (const item of items) {
    if (item.potion !== undefined) javaByKey[getPotionKey(item.id, item.potion)] = item;
    if (item.bedrockPotion !== undefined) {
      const resolved = resolveItemId(item.id, MinecraftVersion.Bedrock);
      if (
        resolved &&
        (resolved.id === item.id || resolveBedrockPotionItem(resolved.id, item.bedrockPotion))
      ) {
        bedrockByKey[getPotionKey(resolved.id, item.bedrockPotion)] = { ...item, id: resolved.id };
      }
    }
  }
  return { version: file.version, items, javaByKey, bedrockByKey };
}

export function selectPotionVersion(
  target: string,
  available: readonly string[],
): string | undefined {
  return available
    .filter((version) => compareMinecraftVersions(version, target) <= 0)
    .sort(compareMinecraftVersions)
    .at(-1);
}

export function newestBedrockPotionVersion(available: readonly string[]): string | undefined {
  return [...available].sort(compareMinecraftVersions).at(-1);
}

export function getPotionChoices(
  catalog: PotionCatalog,
  id: string,
  bedrock = false,
): readonly Potion[] {
  const source = bedrock ? catalog.bedrockByKey : catalog.javaByKey;
  return Object.values(source).filter((item) => item.id === id);
}

export function lookupPotion(
  catalog: PotionCatalog,
  { id, potion }: { id: string; potion: string },
  bedrock = false,
): Potion | undefined {
  return (bedrock ? catalog.bedrockByKey : catalog.javaByKey)[getPotionKey(id, potion)];
}

export const potionAssetBasePath = `${import.meta.env?.BASE_URL ?? "/"}${minecraftTextureAssetPath}`;
