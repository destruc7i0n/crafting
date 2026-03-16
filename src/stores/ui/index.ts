import { create } from "zustand";
import { persist } from "zustand/middleware";

import { IngredientItem } from "@/data/models/types";

export interface UIState {
  isMobileRecipeSidebarOpen: boolean;
  isRecipeSidebarExpanded: boolean;
  showAddItemForm: boolean;
  selectedIngredient?: IngredientItem;
}

export interface UIStateActions {
  setMobileRecipeSidebarOpen: (isOpen: boolean) => void;
  toggleRecipeSidebar: () => void;
  toggleAddItemForm: () => void;
  setSelectedIngredient: (item?: IngredientItem) => void;
}

export const useUIStore = create<UIState & UIStateActions>()(
  persist(
    (set) => ({
      isMobileRecipeSidebarOpen: false,
      isRecipeSidebarExpanded: true,
      showAddItemForm: false,
      selectedIngredient: undefined,
      setMobileRecipeSidebarOpen: (isOpen) => set({ isMobileRecipeSidebarOpen: isOpen }),
      toggleRecipeSidebar: () =>
        set((state) => ({ isRecipeSidebarExpanded: !state.isRecipeSidebarExpanded })),
      toggleAddItemForm: () => set((state) => ({ showAddItemForm: !state.showAddItemForm })),
      setSelectedIngredient: (item) => set({ selectedIngredient: item }),
    }),
    {
      name: "crafting-ui",
      partialize: (state) => ({ isRecipeSidebarExpanded: state.isRecipeSidebarExpanded }),
    },
  ),
);
