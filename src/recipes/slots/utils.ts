import { IngredientItem } from "@/data/models/types";
import { RecipeType } from "@/data/types";
import { getRecipeDefinition, recipeResultSlots } from "@/recipes/definitions";
import { isTagSlotValue } from "@/stores/recipe/slot-value";
import { Recipe, RecipeSlotValue } from "@/stores/recipe/types";

import { RecipeSlot } from "./index";

const resultSlots = new Set<RecipeSlot>(recipeResultSlots);

export const isResultSlot = (slot: RecipeSlot) => resultSlots.has(slot);

export const canRecipeSlotAcceptIngredientItem = (slot: RecipeSlot, item: IngredientItem) =>
  item.type !== "tag_item" || !isResultSlot(slot);

export const canRecipeSlotAcceptSlotValue = (slot: RecipeSlot, value: RecipeSlotValue) =>
  !isTagSlotValue(value) || !isResultSlot(slot);

export const isRecipeSlotDisabled = (recipe: Recipe, slot: RecipeSlot) =>
  getRecipeDefinition(recipe.recipeType).slots.isDisabled(recipe, slot);

export const findFirstEmptyRecipeSlot = (
  recipe: Recipe,
  item: IngredientItem,
): RecipeSlot | undefined => {
  const orderedSlots = getRecipeDefinition(recipe.recipeType).slots.getAutoPlace(recipe);

  return orderedSlots.find((slot) => {
    if (recipe.slots[slot]) {
      return false;
    }

    if (isRecipeSlotDisabled(recipe, slot)) {
      return false;
    }

    return canRecipeSlotAcceptIngredientItem(slot, item);
  });
};

export const canEditRecipeSlotCount = (recipeType: RecipeType, slot: RecipeSlot) =>
  getRecipeDefinition(recipeType).slots.canEditCount(slot);
