import { createContext, useCallback } from "react";

import { MinecraftIdentifier } from "@/data/models/identifier/MinecraftIdentifier";
import { Item as ItemModel } from "@/data/models/item/Item";
import { Registry } from "@/data/models/Registry";
import { MinecraftVersion } from "@/data/types";
import { useMinecraftTextures } from "@/hooks/use-minecraft-textures";

type ResourcesContextState = {
  error: Error | null;
  loading: boolean;
  registry: Registry<MinecraftIdentifier, ItemModel> | null;
  getTextureForId: (id: MinecraftIdentifier) => string | null;
};

const initialState: ResourcesContextState = {
  error: null,
  loading: true,
  registry: null,
  getTextureForId: () => null,
};

export const ResourcesContext =
  createContext<ResourcesContextState>(initialState);

type ResourcesProviderProps = {
  children: React.ReactNode;
};

export const ResourcesProvider = ({ children }: ResourcesProviderProps) => {
  const { registry, texturesRegistry, error, loading } = useMinecraftTextures(
    MinecraftVersion.V120,
  );

  const getTextureForId = useCallback(
    (id: MinecraftIdentifier) => texturesRegistry?.get(id) ?? null,
    [texturesRegistry],
  );

  return (
    <ResourcesContext.Provider
      value={{
        error,
        loading,
        registry,
        getTextureForId,
      }}
    >
      {children}
    </ResourcesContext.Provider>
  );
};
