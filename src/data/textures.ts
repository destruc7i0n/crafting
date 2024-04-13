import { MinecraftVersion } from "./types";

type TexturesMap = Record<string, string>;

type TexturesByVersion = Partial<Record<MinecraftVersion, TexturesMap>>;

export const defaultTextures: TexturesByVersion = {};

export const storeGlobalTexturesVersion = (
  version: MinecraftVersion,
  texturesMap: TexturesMap,
) => {
  defaultTextures[version] = texturesMap;
};

export const getGlobalTextures = (version: MinecraftVersion) => {
  return defaultTextures[version];
};
