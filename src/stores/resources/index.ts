import { create } from "zustand";

import { Item } from "@/data/models/types";
import { PotionCatalog } from "@/data/potions";
import { MinecraftVersion } from "@/data/types";

export interface VersionResourceData {
  items: Item[];
  itemsById: Record<string, Item>;
  vanillaTags: Record<string, string[]>;
}

export type ResourcesState = {
  [key in MinecraftVersion]?: VersionResourceData;
};

export type PotionLoadState = {
  status: "idle" | "loading" | "ready" | "error";
  catalog?: PotionCatalog;
  error?: string;
};

export type PotionResourcesState = {
  potionCatalogs: Record<string, PotionLoadState>;
};

type ResourcesActions = {
  setResourceData: (version: MinecraftVersion, data: VersionResourceData) => void;
  setPotionState: (version: string, state: PotionLoadState) => void;
};

export const useResourcesStore = create<ResourcesState & PotionResourcesState & ResourcesActions>(
  (set) => ({
    potionCatalogs: {},
    setResourceData: (version, data) => set(() => ({ [version]: data })),
    setPotionState: (version, state) =>
      set((current) => ({ potionCatalogs: { ...current.potionCatalogs, [version]: state } })),
  }),
);
