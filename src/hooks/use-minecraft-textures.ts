import { useEffect, useState } from "react";

import type { TexturesType } from "minecraft-textures";

import { MinecraftIdentifier } from "@/data/models/identifier/MinecraftIdentifier";
import { Item as ItemModel } from "@/data/models/item/Item";
import { Registry } from "@/data/models/Registry";
import { MinecraftVersion } from "@/data/types";

export const useMinecraftTextures = (version: MinecraftVersion) => {
  const [registries, setRegistries] = useState<
    Partial<Record<MinecraftVersion, Registry<MinecraftIdentifier, ItemModel>>>
  >({});
  const [texturesRegistries, setTexturesRegistries] = useState<
    Partial<Record<MinecraftVersion, Registry<MinecraftIdentifier, string>>>
  >({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRegistry = async () => {
      if (registries[version]) {
        setLoading(false);
        return;
      }

      try {
        const module: TexturesType = await import(
          `../../node_modules/minecraft-textures/dist/textures/json/${version}.json`
        );

        const registry = new Registry<MinecraftIdentifier, ItemModel>();
        const texturesRegistry = new Registry<MinecraftIdentifier, string>();

        for (const texture of module.items) {
          const identifier = MinecraftIdentifier.from(texture.id);
          registry.register(
            identifier,
            new ItemModel(identifier, texture.readable, 0),
          );
          texturesRegistry.register(identifier, texture.texture);
        }

        setRegistries((prevData) => ({ ...prevData, [version]: registry }));
        setTexturesRegistries((prevData) => ({
          ...prevData,
          [version]: texturesRegistry,
        }));
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistry();
  }, [version, registries]);

  return {
    registry: registries[version] || null,
    texturesRegistry: texturesRegistries[version] || null,
    loading,
    error,
  };
};
