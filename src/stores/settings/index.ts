import { create } from "zustand";

import { MinecraftVersion } from "@/data/types";

export interface SettingsState {
  minecraftVersion: MinecraftVersion;
}

type SettingsActions = {
  setMinecraftVersion: (version: MinecraftVersion) => void;
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  (set) => ({
    minecraftVersion: MinecraftVersion.V120,

    setMinecraftVersion: (version: MinecraftVersion) =>
      set({ minecraftVersion: version }),
  }),
);
