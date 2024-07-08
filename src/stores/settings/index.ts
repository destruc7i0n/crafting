import { create } from "zustand";

import { latestMinecraftVersion } from "@/data/constants";
import { MinecraftVersion } from "@/data/types";

export interface SettingsState {
  minecraftVersion: MinecraftVersion;
}

type SettingsActions = {
  setMinecraftVersion: (version: MinecraftVersion) => void;
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  (set) => ({
    minecraftVersion: latestMinecraftVersion,

    setMinecraftVersion: (version: MinecraftVersion) =>
      set({ minecraftVersion: version }),
  }),
);
