import { create } from "zustand";
import { persist } from "zustand/middleware";

import { IngredientItem } from "@/data/models/types";
import { RecipeSlot } from "@/data/types";

export interface IngredientSelection {
  item: IngredientItem;
  replaceTarget?: RecipeSlot;
}

export interface PreviewSelection {
  item: IngredientItem;
  slot: RecipeSlot;
  replaceTarget?: RecipeSlot;
}

export interface UIState {
  isMobileRecipeSidebarOpen: boolean;
  isRecipeSidebarExpanded: boolean;
  selectedIngredient?: IngredientSelection;
  selectedPreview?: PreviewSelection;
}

export interface UIStateActions {
  setMobileRecipeSidebarOpen: (isOpen: boolean) => void;
  toggleRecipeSidebar: () => void;
  setSelectedIngredient: (ingredient?: IngredientSelection) => void;
  setSelectedPreview: (preview?: PreviewSelection) => void;
}

export const useUIStore = create<UIState & UIStateActions>()(
  persist(
    (set) => ({
      isMobileRecipeSidebarOpen: false,
      isRecipeSidebarExpanded: true,
      selectedIngredient: undefined,
      selectedPreview: undefined,
      setMobileRecipeSidebarOpen: (isOpen) => set({ isMobileRecipeSidebarOpen: isOpen }),
      toggleRecipeSidebar: () =>
        set((state) => ({ isRecipeSidebarExpanded: !state.isRecipeSidebarExpanded })),
      setSelectedIngredient: (ingredient) =>
        set({ selectedIngredient: ingredient, selectedPreview: undefined }),
      setSelectedPreview: (preview) =>
        set({ selectedPreview: preview, selectedIngredient: undefined }),
    }),
    {
      name: "crafting-ui",
      version: 0,
      partialize: (state) => ({ isRecipeSidebarExpanded: state.isRecipeSidebarExpanded }),
    },
  ),
);
