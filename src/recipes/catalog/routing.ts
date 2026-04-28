import { RecipeType } from "@/data/types";

export type RecipesSearch = {
  q: string;
  recipeType: RecipeType | "all";
};

export const recipesSearchDefaults = {
  q: "",
  recipeType: "all",
} satisfies RecipesSearch;

export function validateRecipesSearch(search: Record<string, unknown>): RecipesSearch {
  return {
    q: typeof search.q === "string" ? search.q : "",
    recipeType: isRecipeType(search.recipeType) ? search.recipeType : "all",
  };
}

export function mergeRecipesSearch(
  previous: Record<string, unknown>,
  next: Partial<RecipesSearch>,
): RecipesSearch {
  return {
    ...validateRecipesSearch(previous),
    ...next,
  };
}

function isRecipeType(value: unknown): value is RecipeType {
  return typeof value === "string" && recipeTypes.has(value as RecipeType);
}

const recipeTypes = new Set(Object.values(RecipeType));
