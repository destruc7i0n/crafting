import { createSelector } from "reselect";

import { RecipeSlot } from "@/data/types";

import { RecipeState } from "./index";

export const selectCurrentRecipe = (state: RecipeState) =>
  state.recipes[state.selectedRecipeIndex];

export const selectCurrentRecipeSlot = (slot: RecipeSlot) =>
  createSelector(selectCurrentRecipe, (recipe) => recipe?.slots[slot]);

export const selectCurrentRecipeType = createSelector(
  selectCurrentRecipe,
  (recipe) => recipe?.recipeType,
);
