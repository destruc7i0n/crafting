import { create } from "zustand";
import { persist } from "zustand/middleware";

import { IngredientItem } from "@/data/models/types";
import { RecipeSlot } from "@/data/types";

export type ItemSelection =
  | { source: "ingredients"; item: IngredientItem }
  | { source: "preview"; item: IngredientItem; slot: RecipeSlot };

export interface UIState {
  isMobileRecipeSidebarOpen: boolean;
  isRecipeSidebarExpanded: boolean;
  selectedItem?: ItemSelection;
}

export interface UIStateActions {
  setMobileRecipeSidebarOpen: (isOpen: boolean) => void;
  toggleRecipeSidebar: () => void;
  setSelectedItem: (item?: ItemSelection) => void;
}

export const useUIStore = create<UIState & UIStateActions>()(
  persist(
    (set) => ({
      isMobileRecipeSidebarOpen: false,
      isRecipeSidebarExpanded: true,
      selectedItem: undefined,
      setMobileRecipeSidebarOpen: (isOpen) => set({ isMobileRecipeSidebarOpen: isOpen }),
      toggleRecipeSidebar: () =>
        set((state) => ({ isRecipeSidebarExpanded: !state.isRecipeSidebarExpanded })),
      setSelectedItem: (item) => set({ selectedItem: item }),
    }),
    {
      name: "crafting-ui",
      version: 0,
      partialize: (state) => ({ isRecipeSidebarExpanded: state.isRecipeSidebarExpanded }),
    },
  ),
);
