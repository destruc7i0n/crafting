import { TexturesType, versions } from "minecraft-textures";

import { MinecraftIdentifier } from "../models/identifier/MinecraftIdentifier";
import { MinecraftVersionIdentifier } from "../models/identifier/MinecraftVersionIdentifier";
import { Item as ItemModel } from "../models/item/Item";
import { Registry } from "../models/Registry";

export const itemRegistries = new Map<
  MinecraftVersionIdentifier,
  Registry<MinecraftIdentifier, ItemModel> | null
>();
// init all versions
for (const version of versions) {
  itemRegistries.set(MinecraftVersionIdentifier.from(version), null);
}

export async function getRegistryByVersion(
  version: string,
): Promise<Registry<MinecraftIdentifier, ItemModel>> {
  const mcVersion = MinecraftVersionIdentifier.from(version);
  if (!itemRegistries.get(mcVersion)) {
    const registry = new Registry<MinecraftIdentifier, ItemModel>();
    const { items }: TexturesType = await import(
      `minecraft-textures/dist/textures/json/${version}.json`
    );
    for (const texture of items) {
      const identifier = MinecraftIdentifier.from(texture.id);
      registry.register(
        identifier,
        new ItemModel(identifier, texture.readable, 0, texture.texture),
      );
    }
  }
  return itemRegistries.get(mcVersion)!;
}
