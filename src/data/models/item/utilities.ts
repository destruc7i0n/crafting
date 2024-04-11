import { Item as MinecraftTexturesItem } from "minecraft-textures";

import { parseStringToMinecraftIdentifier } from "../identifier/utilities";
import { Item } from "../types";

export function transformMinecraftTexturesItem(
  item: MinecraftTexturesItem,
): Item {
  return {
    id: parseStringToMinecraftIdentifier(item.id),
    displayName: item.readable,
  };
}

export function cloneItem(item: Item): Item {
  return {
    id: { ...item.id },
    displayName: item.displayName,
    count: item.count,
  };
}
