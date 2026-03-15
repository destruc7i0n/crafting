import { create } from "zustand";

import { IngredientItem } from "@/data/models/types";

export interface UIState {
  isRecipeSidebarOpen: boolean;
  isSidebarExpanded: boolean;
  showAddItemForm: boolean;
  selectedIngredient?: IngredientItem;
}

export interface UIStateActions {
  setRecipeSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
  toggleAddItemForm: () => void;
  setSelectedIngredient: (item?: IngredientItem) => void;
}

export const useUIStore = create<UIState & UIStateActions>((set) => ({
  isRecipeSidebarOpen: false,
  isSidebarExpanded: false,
  showAddItemForm: false,
  selectedIngredient: undefined,
  setRecipeSidebarOpen: (isOpen) => set({ isRecipeSidebarOpen: isOpen }),
  toggleSidebar: () => set((state) => ({ isSidebarExpanded: !state.isSidebarExpanded })),
  toggleAddItemForm: () => set((state) => ({ showAddItemForm: !state.showAddItemForm })),
  setSelectedIngredient: (item) => set({ selectedIngredient: item }),
}));
