import { RecipeSlot } from "@/data/types";

import { RecipeState } from "./index";

export const selectCurrentRecipe = (state: RecipeState) => state.recipes[state.selectedRecipeIndex];

export const selectCurrentRecipeSlot = (slot: RecipeSlot) => (state: RecipeState) =>
  selectCurrentRecipe(state)?.slots[slot];

export const selectCurrentRecipeType = (state: RecipeState) =>
  selectCurrentRecipe(state)?.recipeType;

export const selectCurrentRecipeName = (state: RecipeState) =>
  selectCurrentRecipe(state)?.recipeName;
