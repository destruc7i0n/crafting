import { create } from "zustand";

import { latestMinecraftVersion } from "@/data/constants";
import { MinecraftVersion } from "@/data/types";

// default to bedrock on touch devices
const isTouchDevice =
  typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
const defaultVersion = isTouchDevice ? MinecraftVersion.Bedrock : latestMinecraftVersion;

export interface SettingsState {
  minecraftVersion: MinecraftVersion;
}

type SettingsActions = {
  setMinecraftVersion: (version: MinecraftVersion) => void;
};

export const useSettingsStore = create<SettingsState & SettingsActions>()((set) => ({
  minecraftVersion: defaultVersion,

  setMinecraftVersion: (version: MinecraftVersion) => set({ minecraftVersion: version }),
}));
