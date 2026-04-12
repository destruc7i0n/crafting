import { RecipeSlot } from "@/recipes/slots";

import { RecipeState } from "./types";

export const selectSelectedRecipeId = (state: RecipeState) => state.selectedRecipeId;

export const selectRecipeById = (id: string) => (state: RecipeState) =>
  state.recipes.find((recipe) => recipe.id === id);

export const selectCurrentRecipe = (state: RecipeState) =>
  selectRecipeById(state.selectedRecipeId)(state);

export const selectCurrentRecipeSlot = (slot: RecipeSlot) => (state: RecipeState) =>
  selectCurrentRecipe(state)?.slots[slot];

export const selectCurrentRecipeType = (state: RecipeState) =>
  selectCurrentRecipe(state)?.recipeType;
