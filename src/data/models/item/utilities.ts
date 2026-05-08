import { MinecraftVersion } from "@/data/types";

import { parseStringToMinecraftIdentifier } from "../identifier/utilities";
import { BaseItem, IngredientItem, Item } from "../types";

type MinecraftTexturesItemLike = {
  readable: string;
  id: string;
  texture: string;
};

export function transformMinecraftTexturesItem(
  item: MinecraftTexturesItemLike,
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
    return { type: "custom_item", ...baseItem, uid: item.uid, texture: item.texture };
  }

  return {
    type: "tag_item",
    ...baseItem,
    tagSource: item.tagSource,
    uid: item.uid,
    values: [...item.values],
  };
}
