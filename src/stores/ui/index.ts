import { create } from "zustand";

import { IngredientItem } from "@/data/models/types";

export interface UIState {
  isRecipeSidebarOpen: boolean;
  isSidebarExpanded: boolean;
  showAddItemForm: boolean;
  showAddTagForm: boolean;
  selectedIngredient?: IngredientItem;
}

export interface UIStateActions {
  setRecipeSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
  toggleAddItemForm: () => void;
  toggleAddTagForm: () => void;
  setSelectedIngredient: (item?: IngredientItem) => void;
}

export const useUIStore = create<UIState & UIStateActions>((set) => ({
  isRecipeSidebarOpen: false,
  isSidebarExpanded: false,
  showAddItemForm: false,
  showAddTagForm: false,
  selectedIngredient: undefined,
  setRecipeSidebarOpen: (isOpen) => set({ isRecipeSidebarOpen: isOpen }),
  toggleSidebar: () => set((state) => ({ isSidebarExpanded: !state.isSidebarExpanded })),
  toggleAddItemForm: () => set((state) => ({ showAddItemForm: !state.showAddItemForm })),
  toggleAddTagForm: () => set((state) => ({ showAddTagForm: !state.showAddTagForm })),
  setSelectedIngredient: (item) => set({ selectedIngredient: item }),
}));
