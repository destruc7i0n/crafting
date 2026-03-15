import { useEffect } from "react";

import { TexturesType as MinecraftTexturesType } from "minecraft-textures";

import { latestMinecraftVersion } from "@/data/constants";
import { transformMinecraftTexturesItem } from "@/data/models/item/utilities";
import { Item } from "@/data/models/types";
import { MinecraftVersion } from "@/data/types";
import { useResourcesStore } from "@/stores/resources";

import { useResourcesForVersion } from "./use-resources-for-version";

const textureLoaders = import.meta.glob<{ default: MinecraftTexturesType }>(
  "/node_modules/minecraft-textures/dist/textures/json/*.json",
);
const tagLoaders = import.meta.glob<{ default: Record<string, Record<string, string[]>> }>(
  "/src/data/generated/tags.json",
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
      const tagModule = tagLoaders["/src/data/generated/tags.json"]
        ? (await tagLoaders["/src/data/generated/tags.json"]()).default
        : {};

      const mcTexturesItems = module.items;

      const items: Item[] = [];
      const itemsById: Record<string, Item> = {};
      const textures: Record<string, string> = {};

      for (const mcTexturesItem of mcTexturesItems) {
        const item = transformMinecraftTexturesItem(mcTexturesItem, version);
        items.push(item);
        itemsById[item.id.raw] = item;
        textures[item.id.raw] = mcTexturesItem.texture;
      }

      setResourceData(version, {
        items,
        itemsById,
        vanillaTags: tagModule[version] ?? {},
      });
    };

    fetchResources();
  }, [version, resources, setResourceData]);
};
