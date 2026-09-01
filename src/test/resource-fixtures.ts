import {
  getRawId,
  identifierUniqueKey,
  parseStringToMinecraftIdentifier,
} from "@/data/models/identifier/utilities";
import { Item } from "@/data/models/types";
import { MinecraftVersion } from "@/data/types";
import { VersionResourceData, useResourcesStore } from "@/stores/resources";

export const makeItem = (
  id: string,
  displayName?: string,
  version: MinecraftVersion = MinecraftVersion.V121,
): Item => ({
  type: "default_item",
  id: parseStringToMinecraftIdentifier(id),
  displayName: displayName ?? id,
  texture: `${id}.png`,
  _version: version,
});

/**
 * Builds resource data the same way the loader does: items are indexed by their
 * unique key and, when they carry a data value, additionally by their plain id.
 */
export const makeResources = (
  items: Item[],
  vanillaTags: Record<string, string[]> = {},
): VersionResourceData => {
  const itemsById: Record<string, Item> = {};

  for (const item of items) {
    const key = identifierUniqueKey(item.id);
    itemsById[key] ??= item;

    if (item.id.data !== undefined) {
      itemsById[getRawId(item.id)] ??= item;
    }
  }

  return { items, itemsById, vanillaTags };
};

export const seedResources = (
  version: MinecraftVersion,
  items: Item[],
  vanillaTags?: Record<string, string[]>,
): VersionResourceData => {
  const data = makeResources(items, vanillaTags);
  useResourcesStore.getState().setResourceData(version, data);
  return data;
};
