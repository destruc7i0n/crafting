import { create } from "zustand";
import { persist } from "zustand/middleware";

import { IngredientItem } from "@/data/models/types";

export interface UIState {
  isMobileRecipeSidebarOpen: boolean;
  isRecipeSidebarExpanded: boolean;
  selectedIngredient?: IngredientItem;
}

export interface UIStateActions {
  setMobileRecipeSidebarOpen: (isOpen: boolean) => void;
  toggleRecipeSidebar: () => void;
  setSelectedIngredient: (item?: IngredientItem) => void;
}

export const useUIStore = create<UIState & UIStateActions>()(
  persist(
    (set) => ({
      isMobileRecipeSidebarOpen: false,
      isRecipeSidebarExpanded: true,
      selectedIngredient: undefined,
      setMobileRecipeSidebarOpen: (isOpen) => set({ isMobileRecipeSidebarOpen: isOpen }),
      toggleRecipeSidebar: () =>
        set((state) => ({ isRecipeSidebarExpanded: !state.isRecipeSidebarExpanded })),
      setSelectedIngredient: (item) => set({ selectedIngredient: item }),
    }),
    {
      name: "crafting-ui",
      version: 0,
      partialize: (state) => ({ isRecipeSidebarExpanded: state.isRecipeSidebarExpanded }),
    },
  ),
);
