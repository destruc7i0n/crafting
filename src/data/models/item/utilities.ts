import { Item as MinecraftTexturesItem } from "minecraft-textures";

import { MinecraftVersion } from "@/data/types";

import { parseStringToMinecraftIdentifier } from "../identifier/utilities";
import { BaseItem, CustomItem, Item } from "../types";

export function transformMinecraftTexturesItem(
  item: MinecraftTexturesItem,
  version: MinecraftVersion,
): Item {
  return {
    type: "default_item",
    id: parseStringToMinecraftIdentifier(item.id),
    displayName: item.readable,
    _version: version,
  };
}

export function cloneItem(item: Item): Item;
export function cloneItem(item: CustomItem): CustomItem;
export function cloneItem(item: Item | CustomItem): Item | CustomItem {
  const baseItem: BaseItem = {
    id: { ...item.id },
    displayName: item.displayName,
    count: item.count,
    _version: item._version,
  };

  if (item.type === "default_item") {
    return { type: "default_item", ...baseItem };
  } else {
    return { type: "custom_item", ...baseItem, texture: item.texture };
  }
}
