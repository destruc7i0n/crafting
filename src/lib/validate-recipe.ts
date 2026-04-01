import { validateCooking } from "@/data/generate/cooking";
import { validateCrafting } from "@/data/generate/crafting";
import { validateSmithing } from "@/data/generate/smithing";
import { validateStonecutter } from "@/data/generate/stonecutter";
import { validateTransmute } from "@/data/generate/transmute";
import { MinecraftVersion, RecipeType } from "@/data/types";
import { getSupportedRecipeTypesForVersion } from "@/data/versions";
import { isResultSlot } from "@/lib/recipe-slots";
import { supportsItemTagsForVersion } from "@/lib/tags";
import { SingleRecipeState } from "@/stores/recipe";

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

  const hasTagIngredient = Object.values(recipe.slots).some((item) => item?.type === "tag_item");
  if (hasTagIngredient && !supportsItemTagsForVersion(version)) {
    errors.push(`Item tags are not available in ${getVersionLabel(version)}`);
  }

  const invalidTagResultSlots = Object.entries(recipe.slots)
    .filter(
      ([slot, item]) =>
        item?.type === "tag_item" && isResultSlot(slot as keyof typeof recipe.slots),
    )
    .map(([slot]) => slot);

  if (invalidTagResultSlots.length > 0) {
    errors.push("Result slots must contain items, not tags");
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
      errors.push(...validateCooking(recipe, version));
      break;
    case RecipeType.Stonecutter:
      errors.push(...validateStonecutter(recipe));
      break;
    case RecipeType.Smithing:
    case RecipeType.SmithingTrim:
    case RecipeType.SmithingTransform:
      errors.push(...validateSmithing(recipe, version));
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
