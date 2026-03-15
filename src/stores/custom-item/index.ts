import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { NoTextureTexture } from "@/data/constants";
import { CustomItem, MinecraftIdentifier } from "@/data/models/types";
import { MinecraftVersion } from "@/data/types";

export interface CustomItemState {
  customItems: CustomItem[];
}

type CustomItemUpdates = Partial<Pick<CustomItem, "displayName" | "texture">> & {
  rawId?: string;
};

type CustomItemActions = {
  addCustomItem: (name: string, rawId: string, texture: string, version: MinecraftVersion) => void;
  updateCustomItem: (currentRawId: string, updates: CustomItemUpdates) => void;
  deleteCustomItem: (rawId: string) => void;
};

const parseIdentifier = (raw: string): MinecraftIdentifier => {
  const trimmed = raw
    .split(" ")
    .join("_")
    .toLowerCase()
    .replace(/[^a-z0-9_:./-]/g, "");

  const hasNamespace = trimmed.includes(":");
  const fullId = hasNamespace ? trimmed : `minecraft:${trimmed}`;
  const [namespace, ...rest] = fullId.split(":");
  const id = rest.join(":");

  return { raw: fullId, namespace, id };
};

export const useCustomItemStore = create<CustomItemState & CustomItemActions>()(
  persist(
    immer((set, get) => ({
      customItems: [],

      addCustomItem: (name, rawId, texture, version) => {
        const id = parseIdentifier(rawId);

        if (get().customItems.some((item) => item.id.raw === id.raw)) {
          return;
        }

        const item: CustomItem = {
          type: "custom_item",
          id,
          displayName: name,
          texture: texture || NoTextureTexture,
          _version: version,
        };

        set((state) => {
          state.customItems.push(item);
        });
      },

      updateCustomItem: (currentRawId, updates) => {
        set((state) => {
          const item = state.customItems.find((i) => i.id.raw === currentRawId);
          if (!item) return;

          if (updates.displayName !== undefined) {
            item.displayName = updates.displayName;
          }

          if (updates.texture !== undefined) {
            item.texture = updates.texture || NoTextureTexture;
          }

          if (updates.rawId !== undefined) {
            const newId = parseIdentifier(updates.rawId);
            const duplicate = state.customItems.some(
              (i) => i.id.raw !== currentRawId && i.id.raw === newId.raw,
            );
            if (!duplicate) {
              item.id = newId;
            }
          }
        });
      },

      deleteCustomItem: (rawId) => {
        set((state) => {
          state.customItems = state.customItems.filter((item) => item.id.raw !== rawId);
        });
      },
    })),
    {
      name: "crafting-custom-items",
      partialize: (state) => ({ customItems: state.customItems }),
    },
  ),
);
