import { create } from "zustand";

import { Item } from "@/data/models/types";

export type UIView = "main" | "tagCreation";

export interface UIState {
  currentView: UIView;
  isRecipeSidebarOpen: boolean;
  selectedIngredient?: Item;
}

export interface UIStateActions {
  setCurrentView: (view: UIView) => void;
  setRecipeSidebarOpen: (isOpen: boolean) => void;
  setSelectedIngredient: (item?: Item) => void;
}

export const useUIStore = create<UIState & UIStateActions>((set) => ({
  currentView: "main",
  isRecipeSidebarOpen: false,
  selectedIngredient: undefined,
  setCurrentView: (view) => set({ currentView: view }),
  setRecipeSidebarOpen: (isOpen) => set({ isRecipeSidebarOpen: isOpen }),
  setSelectedIngredient: (item) => set({ selectedIngredient: item }),
}));
