import { create } from "zustand";
import { persist } from "zustand/middleware";

import { IngredientItem } from "@/data/models/types";
import { RecipeSlot } from "@/recipes/slots";
import { RecipeSlotValue } from "@/stores/recipe/types";

export type Selection =
  | { type: "ingredient"; item: IngredientItem }
  | { type: "slot"; value: RecipeSlotValue; slot: RecipeSlot };

export interface UIState {
  isHelpDialogOpen: boolean;
  isMobileRecipeSidebarOpen: boolean;
  isRecipeSidebarExpanded: boolean;
  selection?: Selection;
  lastPlacedSlot?: RecipeSlot;
}

export interface UIStateActions {
  openHelpDialog: () => void;
  closeHelpDialog: () => void;
  setMobileRecipeSidebarOpen: (isOpen: boolean) => void;
  toggleRecipeSidebar: () => void;
  selectIngredient: (item: IngredientItem, options?: { lastPlacedSlot?: RecipeSlot }) => void;
  selectSlot: (slot: RecipeSlot, value: RecipeSlotValue) => void;
  clearInteractionState: () => void;
}

export const useUIStore = create<UIState & UIStateActions>()(
  persist(
    (set) => ({
      isHelpDialogOpen: true,
      isMobileRecipeSidebarOpen: false,
      isRecipeSidebarExpanded: true,
      selection: undefined,
      lastPlacedSlot: undefined,
      openHelpDialog: () => set({ isHelpDialogOpen: true }),
      closeHelpDialog: () => set({ isHelpDialogOpen: false }),
      setMobileRecipeSidebarOpen: (isOpen) => set({ isMobileRecipeSidebarOpen: isOpen }),
      toggleRecipeSidebar: () =>
        set((state) => ({ isRecipeSidebarExpanded: !state.isRecipeSidebarExpanded })),
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
        isHelpDialogOpen: state.isHelpDialogOpen,
        isRecipeSidebarExpanded: state.isRecipeSidebarExpanded,
      }),
    },
  ),
);
