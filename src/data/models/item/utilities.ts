import { Item as MinecraftTexturesItem } from "minecraft-textures";

import { MinecraftVersion } from "@/data/types";

import { parseStringToMinecraftIdentifier } from "../identifier/utilities";
import { BaseItem, IngredientItem, Item } from "../types";

export function transformMinecraftTexturesItem(
  item: MinecraftTexturesItem,
  version: MinecraftVersion,
): Item {
  return {
    type: "default_item",
    id: parseStringToMinecraftIdentifier(item.id),
    displayName: item.readable,
    texture: item.texture,
    _version: version,
  };
}

export function cloneItem(item: IngredientItem): IngredientItem {
  const baseItem: BaseItem = {
    id: { ...item.id },
    displayName: item.displayName,
    texture: item.texture,
    count: item.count,
    _version: item._version,
  };

  if (item.type === "default_item") {
    return { type: "default_item", ...baseItem };
  }

  if (item.type === "custom_item") {
    return { type: "custom_item", ...baseItem, texture: item.texture };
  }

  return {
    type: "tag_item",
    ...baseItem,
    tagSource: item.tagSource,
    tagUid: item.tagUid,
    values: [...item.values],
  };
}
