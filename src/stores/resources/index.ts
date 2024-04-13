import { create } from "zustand";

import { Item } from "@/data/models/types";
import { MinecraftVersion } from "@/data/types";

export interface VersionResourceData {
  items: Item[];
  itemsById: Record<string, Item>;
}

export type ResourcesState = {
  [key in MinecraftVersion]?: VersionResourceData;
};

type ResourcesActions = {
  setResourceData: (
    version: MinecraftVersion,
    data: VersionResourceData,
  ) => void;
};

export const useResourcesStore = create<ResourcesState & ResourcesActions>(
  (set) => ({
    setResourceData: (version, data) => set(() => ({ [version]: data })),
  }),
);
