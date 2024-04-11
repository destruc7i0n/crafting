import { Item as MinecraftTexturesItem } from "minecraft-textures";

import { MinecraftVersion } from "@/data/types";

import { parseStringToMinecraftIdentifier } from "../identifier/utilities";
import { Item } from "../types";

export function transformMinecraftTexturesItem(
  item: MinecraftTexturesItem,
  version: MinecraftVersion,
): Item {
  return {
    id: parseStringToMinecraftIdentifier(item.id),
    displayName: item.readable,
    _version: version,
  };
}

export function cloneItem(item: Item): Item {
  return {
    id: { ...item.id },
    displayName: item.displayName,
    count: item.count,
    _version: item._version,
  };
}
