import { SingleRecipeState } from "@/stores/recipe";

import { validateCooking } from "@/data/generate/cooking";
import { validateCrafting } from "@/data/generate/crafting";
import { validateSmithing } from "@/data/generate/smithing";
import { validateStonecutter } from "@/data/generate/stonecutter";
import { validateTransmute } from "@/data/generate/transmute";
import { MinecraftVersion, RecipeType } from "@/data/types";
import { getSupportedRecipeTypesForVersion } from "@/data/versions";

export interface RecipeValidation {
  valid: boolean;
  errors: string[];
}

const getVersionLabel = (version: MinecraftVersion) => {
  return version === MinecraftVersion.Bedrock ? "Bedrock" : `Java ${version}`;
};

export const validateRecipe = (
  recipe: SingleRecipeState,
  version: MinecraftVersion,
): RecipeValidation => {
  const errors: string[] = [];

  if (!getSupportedRecipeTypesForVersion(version).includes(recipe.recipeType)) {
    errors.push(`Recipe type is not available in ${getVersionLabel(version)}`);
  }

  switch (recipe.recipeType) {
    case RecipeType.Crafting:
      errors.push(...validateCrafting(recipe));
      break;
    case RecipeType.CraftingTransmute:
      errors.push(...validateTransmute(recipe));
      break;
    case RecipeType.Smelting:
    case RecipeType.Blasting:
    case RecipeType.CampfireCooking:
    case RecipeType.Smoking:
      errors.push(...validateCooking(recipe));
      break;
    case RecipeType.Stonecutter:
      errors.push(...validateStonecutter(recipe));
      break;
    case RecipeType.Smithing:
    case RecipeType.SmithingTrim:
    case RecipeType.SmithingTransform:
      errors.push(...validateSmithing(recipe));
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
