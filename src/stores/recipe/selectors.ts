import { RecipeSlot } from "@/recipes/slots";

import { RecipeState } from "./types";

export const selectSelectedRecipeId = (state: RecipeState) => state.selectedRecipeId;

export const selectCurrentRecipe = (state: RecipeState) =>
  state.recipes.find((recipe) => recipe.id === state.selectedRecipeId);

export const selectCurrentRecipeSlot = (slot: RecipeSlot) => (state: RecipeState) =>
  selectCurrentRecipe(state)?.slots[slot];

export const selectCurrentRecipeType = (state: RecipeState) =>
  selectCurrentRecipe(state)?.recipeType;
