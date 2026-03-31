import { create } from "zustand";
import { persist } from "zustand/middleware";

import { latestMinecraftVersion } from "@/data/constants";
import { MinecraftVersion } from "@/data/types";

// default to bedrock on touch devices
const isTouchDevice =
  typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
const defaultVersion = isTouchDevice ? MinecraftVersion.Bedrock : latestMinecraftVersion;
export const DEFAULT_BEDROCK_NAMESPACE = "crafting";

export interface SettingsState {
  minecraftVersion: MinecraftVersion;
  bedrockNamespace: string;
}

type SettingsActions = {
  setMinecraftVersion: (version: MinecraftVersion) => void;
  setBedrockNamespace: (namespace: string) => void;
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      minecraftVersion: defaultVersion,
      bedrockNamespace: DEFAULT_BEDROCK_NAMESPACE,

      setMinecraftVersion: (version: MinecraftVersion) => set({ minecraftVersion: version }),
      setBedrockNamespace: (bedrockNamespace: string) => set({ bedrockNamespace }),
    }),
    {
      name: "crafting-settings",
      version: 0,
      partialize: (state) => ({
        minecraftVersion: state.minecraftVersion,
        bedrockNamespace: state.bedrockNamespace,
      }),
    },
  ),
);
