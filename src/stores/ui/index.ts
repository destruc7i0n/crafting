import { create } from "zustand";
import { persist } from "zustand/middleware";

import { IngredientItem } from "@/data/models/types";
import { RecipeSlot } from "@/recipes/slots";
import { RecipeSlotValue } from "@/stores/recipe/types";

export type Selection =
  | { type: "ingredient"; item: IngredientItem }
  | { type: "slot"; value: RecipeSlotValue; slot: RecipeSlot };

type PreviewExportOptions = {
  hideSingleItemCount: boolean;
};

export interface UIState {
  isMobileRecipeSidebarOpen: boolean;
  isRecipeSidebarExpanded: boolean;
  previewExportOptions: PreviewExportOptions;
  selection?: Selection;
  lastPlacedSlot?: RecipeSlot;
}

export interface UIStateActions {
  setMobileRecipeSidebarOpen: (isOpen: boolean) => void;
  toggleRecipeSidebar: () => void;
  setPreviewExportOptions: (options: Partial<PreviewExportOptions>) => void;
  selectIngredient: (item: IngredientItem, options?: { lastPlacedSlot?: RecipeSlot }) => void;
  selectSlot: (slot: RecipeSlot, value: RecipeSlotValue) => void;
  clearInteractionState: () => void;
}

export const useUIStore = create<UIState & UIStateActions>()(
  persist(
    (set) => ({
      isMobileRecipeSidebarOpen: false,
      isRecipeSidebarExpanded: true,
      previewExportOptions: {
        hideSingleItemCount: true,
      },
      selection: undefined,
      lastPlacedSlot: undefined,
      setMobileRecipeSidebarOpen: (isOpen) => set({ isMobileRecipeSidebarOpen: isOpen }),
      toggleRecipeSidebar: () =>
        set((state) => ({ isRecipeSidebarExpanded: !state.isRecipeSidebarExpanded })),
      setPreviewExportOptions: (options) =>
        set((state) => ({
          previewExportOptions: {
            ...state.previewExportOptions,
            ...options,
          },
        })),
      selectIngredient: (item, options) =>
        set({
          selection: { type: "ingredient", item },
          lastPlacedSlot: options?.lastPlacedSlot,
        }),
      selectSlot: (slot, value) =>
        set({
          selection: { type: "slot", slot, value },
          lastPlacedSlot: undefined,
        }),
      clearInteractionState: () =>
        set({
          selection: undefined,
          lastPlacedSlot: undefined,
        }),
    }),
    {
      name: "crafting-ui",
      version: 0,
      partialize: (state) => ({
        isRecipeSidebarExpanded: state.isRecipeSidebarExpanded,
        previewExportOptions: state.previewExportOptions,
      }),
    },
  ),
);
