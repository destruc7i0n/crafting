import { MinecraftVersion } from "@/data/types";
import { getRecipeDefinition, getSupportedRecipeTypesForVersion } from "@/recipes/definitions";
import { isResultSlot } from "@/recipes/slots/utils";
import { hasMissingCustomRef, isTagSlotValue } from "@/stores/recipe/slot-value";
import { Recipe, SlotContext } from "@/stores/recipe/types";
import { getMinecraftVersionLabel, supportsItemTags } from "@/versioning";

export interface RecipeValidation {
  valid: boolean;
  errors: string[];
}

const validateCommonRecipeRules = (
  recipe: Recipe,
  version: MinecraftVersion,
  slotContext: SlotContext,
): string[] => {
  const errors: string[] = [];

  if (!getSupportedRecipeTypesForVersion(version).includes(recipe.recipeType)) {
    errors.push(`Recipe type is not available in ${getMinecraftVersionLabel(version)}`);
  }

  const hasTagIngredient = Object.values(recipe.slots).some((item) => isTagSlotValue(item));
  if (hasTagIngredient && !supportsItemTags(version)) {
    errors.push(`Item tags are not available in ${getMinecraftVersionLabel(version)}`);
  }

  for (const value of Object.values(recipe.slots)) {
    if (hasMissingCustomRef(value, slotContext)) {
      errors.push(
        value?.kind === "custom_item"
          ? "Recipe references a missing custom item"
          : "Recipe references a missing custom tag",
      );
    }
  }

  const invalidTagResultSlots = Object.entries(recipe.slots)
    .filter(
      ([slot, item]) => isTagSlotValue(item) && isResultSlot(slot as keyof typeof recipe.slots),
    )
    .map(([slot]) => slot);

  if (invalidTagResultSlots.length > 0) {
    errors.push("Result slots must contain items, not tags");
  }

  return errors;
};

export const validateRecipe = (
  recipe: Recipe,
  version: MinecraftVersion,
  slotContext: SlotContext,
): RecipeValidation => {
  const definition = getRecipeDefinition(recipe.recipeType);
  const errors = [
    ...validateCommonRecipeRules(recipe, version, slotContext),
    ...definition.validate(recipe, version, slotContext),
  ];

  return {
    valid: errors.length === 0,
    errors,
  };
};
