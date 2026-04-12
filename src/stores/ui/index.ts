import { create } from "zustand";
import { persist } from "zustand/middleware";

import { IngredientItem } from "@/data/models/types";
import { RecipeSlot } from "@/recipes/slots";
import { RecipeSlotValue } from "@/stores/recipe/types";

export type Selection =
  | { type: "ingredient"; item: IngredientItem }
  | { type: "slot"; value: RecipeSlotValue; slot: RecipeSlot };

export interface UIState {
  isMobileRecipeSidebarOpen: boolean;
  isRecipeSidebarExpanded: boolean;
  selection?: Selection;
}

export interface UIStateActions {
  setMobileRecipeSidebarOpen: (isOpen: boolean) => void;
  toggleRecipeSidebar: () => void;
  setSelection: (selection?: Selection) => void;
}

export const useUIStore = create<UIState & UIStateActions>()(
  persist(
    (set) => ({
      isMobileRecipeSidebarOpen: false,
      isRecipeSidebarExpanded: true,
      selection: undefined,
      setMobileRecipeSidebarOpen: (isOpen) => set({ isMobileRecipeSidebarOpen: isOpen }),
      toggleRecipeSidebar: () =>
        set((state) => ({ isRecipeSidebarExpanded: !state.isRecipeSidebarExpanded })),
      setSelection: (selection) => set({ selection }),
    }),
    {
      name: "crafting-ui",
      version: 0,
      partialize: (state) => ({ isRecipeSidebarExpanded: state.isRecipeSidebarExpanded }),
    },
  ),
);
