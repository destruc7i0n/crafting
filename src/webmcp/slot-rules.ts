import { MinecraftVersion, RecipeType } from "@/data/types";
import { getRecipeDefinition, getRecipeTypeLabel } from "@/recipes/definitions";
import { RecipeSlot, SLOTS } from "@/recipes/slots";
import { canEditRecipeSlotCount, isResultSlot } from "@/recipes/slots/utils";
import { isTagSlotValue } from "@/stores/recipe/slot-value";
import { Recipe, RecipeSlotValue } from "@/stores/recipe/types";
import { getMinecraftVersionLabel, supportsItemTags } from "@/versioning";

const MIN_COUNT = 1;
const MAX_COUNT = 64;

/** Every slot id the editor exposes to agents. Brewing slots are excluded (those types are disabled). */
export const ALL_RECIPE_SLOTS: RecipeSlot[] = [
  ...Object.values(SLOTS.crafting),
  ...Object.values(SLOTS.cooking),
  ...Object.values(SLOTS.smithing),
  ...Object.values(SLOTS.stonecutter),
];

const recipeSlotSet = new Set<string>(ALL_RECIPE_SLOTS);

export const isRecipeSlot = (value: string): value is RecipeSlot => recipeSlotSet.has(value);

export type SlotLayoutEntry = {
  slot: RecipeSlot;
  role: "input" | "result";
  disabled: boolean;
  canEditCount: boolean;
};

export const getSlotLayout = (recipe: Recipe): SlotLayoutEntry[] => {
  const { slots } = getRecipeDefinition(recipe.recipeType);

  return slots.getAutoPlace(recipe).map((slot) => ({
    slot,
    role: isResultSlot(slot) ? "result" : "input",
    disabled: slots.isDisabled(recipe, slot),
    canEditCount: slots.canEditCount(slot),
  }));
};

const getAvailableSlots = (recipe: Recipe): RecipeSlot[] =>
  getSlotLayout(recipe)
    .filter((entry) => !entry.disabled)
    .map((entry) => entry.slot);

export const assertSlotAllowed = (recipe: Recipe, slot: RecipeSlot): void => {
  const availableSlots = getAvailableSlots(recipe);

  if (availableSlots.includes(slot)) {
    return;
  }

  const availableText = `Available slots: ${availableSlots.join(", ")}`;
  const isDisabledByTwoByTwo =
    recipe.recipeType === RecipeType.Crafting &&
    recipe.crafting.twoByTwo &&
    getRecipeDefinition(recipe.recipeType).slots.isDisabled(recipe, slot);

  if (isDisabledByTwoByTwo) {
    throw new Error(`Slot "${slot}" is disabled while twoByTwo is enabled. ${availableText}`);
  }

  throw new Error(
    `Slot "${slot}" is not part of a ${getRecipeTypeLabel(recipe.recipeType)} recipe. ${availableText}`,
  );
};

const assertCountAllowed = ({
  recipe,
  slot,
  count,
}: {
  recipe: Recipe;
  slot: RecipeSlot;
  count: number;
}): void => {
  if (!canEditRecipeSlotCount(recipe.recipeType, slot)) {
    const label = getRecipeTypeLabel(recipe.recipeType);
    const hasEditableCount = getSlotLayout(recipe).some((entry) => entry.canEditCount);

    throw new Error(
      hasEditableCount
        ? `Only the result slot's count can be edited for ${label} recipes`
        : `Counts cannot be edited for ${label} recipes`,
    );
  }

  if (!Number.isInteger(count) || count < MIN_COUNT || count > MAX_COUNT) {
    throw new Error(
      `Count must be an integer between ${MIN_COUNT} and ${MAX_COUNT} (got ${count})`,
    );
  }
};

export const assertSlotValueAllowed = ({
  recipe,
  slot,
  value,
  count,
  version,
}: {
  recipe: Recipe;
  slot: RecipeSlot;
  value: RecipeSlotValue;
  count?: number;
  version: MinecraftVersion;
}): void => {
  if (isTagSlotValue(value)) {
    if (!supportsItemTags(version)) {
      throw new Error(`Item tags are not available in ${getMinecraftVersionLabel(version)}`);
    }

    if (isResultSlot(slot)) {
      throw new Error("Result slots must contain an item, not a tag");
    }

    if (count !== undefined) {
      throw new Error("Tags do not have a count");
    }
  }

  if (count !== undefined) {
    assertCountAllowed({ recipe, slot, count });
  }
};
