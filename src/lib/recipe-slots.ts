import { IngredientItem } from "@/data/models/types";
import { RecipeSlot, RecipeType } from "@/data/types";
import { Recipe, RecipeSlotValue } from "@/stores/recipe";
import { isTagSlotValue } from "@/stores/recipe/slot-value";

const autoPlaceSlotsByRecipeType: Record<RecipeType, RecipeSlot[]> = {
  [RecipeType.Crafting]: [
    "crafting.1",
    "crafting.2",
    "crafting.3",
    "crafting.4",
    "crafting.5",
    "crafting.6",
    "crafting.7",
    "crafting.8",
    "crafting.9",
    "crafting.result",
  ],
  [RecipeType.CraftingTransmute]: ["crafting.1", "crafting.2", "crafting.result"],
  [RecipeType.Smelting]: ["cooking.ingredient", "cooking.result"],
  [RecipeType.CampfireCooking]: ["cooking.ingredient", "cooking.result"],
  [RecipeType.Blasting]: ["cooking.ingredient", "cooking.result"],
  [RecipeType.Smoking]: ["cooking.ingredient", "cooking.result"],
  [RecipeType.Stonecutter]: ["stonecutter.ingredient", "stonecutter.result"],
  [RecipeType.Smithing]: [
    "smithing.template",
    "smithing.base",
    "smithing.addition",
    "smithing.result",
  ],
  [RecipeType.SmithingTrim]: ["smithing.template", "smithing.base", "smithing.addition"],
  [RecipeType.SmithingTransform]: [
    "smithing.template",
    "smithing.base",
    "smithing.addition",
    "smithing.result",
  ],
};

const resultSlots = new Set<RecipeSlot>([
  "crafting.result",
  "cooking.result",
  "stonecutter.result",
  "smithing.result",
]);

const disabledTwoByTwoSlots = new Set<RecipeSlot>([
  "crafting.3",
  "crafting.6",
  "crafting.7",
  "crafting.8",
  "crafting.9",
]);

export const isResultSlot = (slot: RecipeSlot) => resultSlots.has(slot);

export const canRecipeSlotAcceptIngredientItem = (slot: RecipeSlot, item: IngredientItem) =>
  item.type !== "tag_item" || !isResultSlot(slot);

export const canRecipeSlotAcceptSlotValue = (slot: RecipeSlot, value: RecipeSlotValue) =>
  !isTagSlotValue(value) || !isResultSlot(slot);

export const isRecipeSlotDisabled = (recipe: Recipe, slot: RecipeSlot) => {
  return (
    recipe.recipeType === RecipeType.Crafting &&
    recipe.crafting.twoByTwo &&
    disabledTwoByTwoSlots.has(slot)
  );
};

export const findFirstEmptyRecipeSlot = (
  recipe: Recipe,
  item: IngredientItem,
): RecipeSlot | undefined => {
  const orderedSlots = autoPlaceSlotsByRecipeType[recipe.recipeType] ?? [];

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

export const canEditRecipeSlotCount = (recipeType: RecipeType, slot: RecipeSlot) => {
  if (!isResultSlot(slot)) {
    return false;
  }

  switch (recipeType) {
    case RecipeType.Crafting:
    case RecipeType.Stonecutter:
    case RecipeType.SmithingTransform:
      return true;
    default:
      return false;
  }
};
