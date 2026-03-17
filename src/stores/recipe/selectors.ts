import { createSelector } from "reselect";

import { RecipeSlot } from "@/data/types";

import { RecipeState } from "./index";

export const selectCurrentRecipe = (state: RecipeState) => state.recipes[state.selectedRecipeIndex];

const slotSelectorCache = new Map<RecipeSlot, (state: RecipeState) => ReturnType<typeof selectCurrentRecipe>["slots"][RecipeSlot]>();

export const selectCurrentRecipeSlot = (slot: RecipeSlot) => {
  let selector = slotSelectorCache.get(slot);
  if (!selector) {
    selector = createSelector(selectCurrentRecipe, (recipe) => recipe?.slots[slot]);
    slotSelectorCache.set(slot, selector);
  }
  return selector;
};

export const selectCurrentRecipeType = createSelector(
  selectCurrentRecipe,
  (recipe) => recipe?.recipeType,
);

export const selectCurrentRecipeName = createSelector(
  selectCurrentRecipe,
  (recipe) => recipe?.recipeName,
);
