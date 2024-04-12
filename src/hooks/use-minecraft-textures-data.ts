import { useEffect } from "react";

import { TexturesType as MinecraftTexturesType } from "minecraft-textures";

import { transformMinecraftTexturesItem } from "@/data/models/item/utilities";
import { Item } from "@/data/models/types";
import { useResourcesStore } from "@/stores/resources";

import { useResourcesForVersion } from "./use-resources-for-version";

export const useMinecraftTexturesData = () => {
  const { version, resources } = useResourcesForVersion();
  const setResourceData = useResourcesStore((state) => state.setResourceData);

  useEffect(() => {
    const fetchResources = async () => {
      if (resources) {
        return;
      }

      const module: MinecraftTexturesType = await import(
        `../../node_modules/minecraft-textures/dist/textures/json/${version}.json`
      );

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
        textures,
      });
    };

    fetchResources();
  }, [version, resources, setResourceData]);
};
