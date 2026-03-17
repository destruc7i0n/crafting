import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { NoTextureTexture } from "@/data/constants";
import { identifierUniqueKey } from "@/data/models/identifier/utilities";
import { CustomItem } from "@/data/models/types";
import { MinecraftVersion } from "@/data/types";
import { parseMinecraftIdentifierInput } from "@/lib/minecraft-identifier";
import { generateUid } from "@/lib/utils";
import { useRecipeStore } from "@/stores/recipe";

export interface CustomItemState {
  customItems: CustomItem[];
}

type CustomItemUpdates = Partial<Pick<CustomItem, "displayName" | "texture">> & {
  rawId?: string;
};

type CustomItemActions = {
  addCustomItem: (name: string, rawId: string, texture: string, version: MinecraftVersion) => void;
  updateCustomItem: (uid: string, updates: CustomItemUpdates) => void;
  deleteCustomItem: (uid: string) => void;
};

const getCustomItemIdentifierVersion = (version: MinecraftVersion) =>
  version === MinecraftVersion.Bedrock ? MinecraftVersion.V12111 : version;


export const useCustomItemStore = create<CustomItemState & CustomItemActions>()(
  persist(
    immer((set, get) => ({
      customItems: [],

      addCustomItem: (name, rawId, texture, version) => {
        const id = parseMinecraftIdentifierInput(rawId, getCustomItemIdentifierVersion(version));

        if (
          get().customItems.some((item) => identifierUniqueKey(item.id) === identifierUniqueKey(id))
        ) {
          return;
        }

        const item: CustomItem = {
          type: "custom_item",
          uid: generateUid("custom-item"),
          id,
          displayName: name,
          texture: texture || NoTextureTexture,
          _version: version,
        };

        set((state) => {
          state.customItems.push(item);
        });
      },

      updateCustomItem: (uid, updates) => {
        let syncedItem: CustomItem | undefined;

        set((state) => {
          const item = state.customItems.find((i) => i.uid === uid);
          if (!item) return;

          if (updates.displayName !== undefined) {
            item.displayName = updates.displayName;
          }

          if (updates.texture !== undefined) {
            item.texture = updates.texture || NoTextureTexture;
          }

          if (updates.rawId !== undefined) {
            const newId = parseMinecraftIdentifierInput(
              updates.rawId,
              getCustomItemIdentifierVersion(item._version),
            );
            const duplicate = state.customItems.some(
              (i) => i.uid !== uid && identifierUniqueKey(i.id) === identifierUniqueKey(newId),
            );
            if (!duplicate) {
              item.id = newId;
            }
          }

          syncedItem = {
            ...item,
            id: { ...item.id },
          };
        });

        if (!syncedItem) {
          return;
        }

        const nextSyncedItem = syncedItem;

        useRecipeStore.getState().syncCustomSlotItem(
          (slotItem) => slotItem.type === "custom_item" && slotItem.uid === nextSyncedItem.uid,
          (slotItem) => {
            slotItem.id = nextSyncedItem.id;
            slotItem.displayName = nextSyncedItem.displayName;
            slotItem.texture = nextSyncedItem.texture;
          },
        );
      },

      deleteCustomItem: (uid) => {
        set((state) => {
          state.customItems = state.customItems.filter((item) => item.uid !== uid);
        });
        useRecipeStore
          .getState()
          .removeMatchingSlotItems((item) => item.type === "custom_item" && item.uid === uid);
      },
    })),
    {
      name: "crafting-custom-items",
      version: 0,
      partialize: (state) => ({ customItems: state.customItems }),
    },
  ),
);
