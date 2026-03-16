import { useEffect } from "react";

import { TexturesType as MinecraftTexturesType } from "minecraft-textures";

import { latestMinecraftVersion } from "@/data/constants";
import {
  identifierUniqueKey,
  parseStringToMinecraftIdentifier,
} from "@/data/models/identifier/utilities";
import { transformMinecraftTexturesItem } from "@/data/models/item/utilities";
import { Item } from "@/data/models/types";
import { MinecraftVersion } from "@/data/types";
import { useResourcesStore } from "@/stores/resources";

import { useResourcesForVersion } from "./use-resources-for-version";

type BedrockTranslation = { id?: string; data?: number } | null;

const textureLoaders = import.meta.glob<{ default: MinecraftTexturesType }>(
  // match 1.20.json but not 1.20.id.json
  "/node_modules/minecraft-textures/dist/textures/json/[0-9]*[0-9].json",
);
const tagLoaders = import.meta.glob<{ default: Record<string, string[]> }>(
  "/src/data/generated/vanilla-tags/*.json",
);

export const useMinecraftTexturesData = () => {
  const { version, resources } = useResourcesForVersion();
  const setResourceData = useResourcesStore((state) => state.setResourceData);

  useEffect(() => {
    const fetchResources = async () => {
      if (resources) {
        return;
      }

      const textureVersion =
        version === MinecraftVersion.Bedrock ? latestMinecraftVersion : version;
      const texturePath = `/node_modules/minecraft-textures/dist/textures/json/${textureVersion}.json`;

      const loadTextureModule =
        textureLoaders[texturePath] ??
        textureLoaders[
          `/node_modules/minecraft-textures/dist/textures/json/${latestMinecraftVersion}.json`
        ];

      if (!loadTextureModule) {
        throw new Error(`No texture dataset found for version ${textureVersion}`);
      }

      const module = (await loadTextureModule()).default;
      let vanillaTags: Record<string, string[]> = {};

      if (version !== MinecraftVersion.Bedrock) {
        const tagPath = `/src/data/generated/vanilla-tags/${version}.json`;
        const loadTagModule = tagLoaders[tagPath];

        if (loadTagModule) {
          vanillaTags = (await loadTagModule()).default;
        }
      }

      const mcTexturesItems = module.items;

      let bedrockMappings: Record<string, BedrockTranslation | undefined> = {};
      if (version === MinecraftVersion.Bedrock) {
        bedrockMappings = (await import("@/data/generated/bedrock-mappings.json")).default;
      }

      const items: Item[] = [];
      const itemsById: Record<string, Item> = {};

      for (const mcTexturesItem of mcTexturesItems) {
        const item = transformMinecraftTexturesItem(mcTexturesItem, version);

        // apply Bedrock-specific ID/data translations
        const translation = bedrockMappings[mcTexturesItem.id];
        if (translation === null) continue; // explicitly excluded (no Bedrock equivalent)
        if (translation) {
          item.id = {
            ...parseStringToMinecraftIdentifier(translation.id ?? mcTexturesItem.id),
            ...(translation.data !== undefined ? { data: translation.data } : {}),
          };
        }

        // skip items that translate to a Bedrock ID already seen
        const key = identifierUniqueKey(item.id);
        if (!itemsById[key]) {
          items.push(item);
          itemsById[key] = item;
        }
      }

      setResourceData(version, {
        items,
        itemsById,
        vanillaTags,
      });
    };

    fetchResources().catch(console.error);
  }, [version, resources, setResourceData]);
};
