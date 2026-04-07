import { getSupportedRecipeTypesForVersion } from "@/recipes/definitions";

import { MinecraftVersion, RecipeType } from "./types";

export const coerceRecipeTypeForVersion = (
  recipeType: RecipeType | undefined,
  version: MinecraftVersion,
): RecipeType => {
  const supportedRecipeTypes = getSupportedRecipeTypesForVersion(version);

  if (recipeType && supportedRecipeTypes.includes(recipeType)) {
    return recipeType;
  }

  return supportedRecipeTypes[0] ?? RecipeType.Crafting;
};
