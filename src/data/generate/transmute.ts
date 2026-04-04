import { Recipe, SlotContext, createEmptySlotContext } from "@/stores/recipe";
import { getRequiredSlotIdentifier, getSlotCount } from "@/stores/recipe/slot-value";

import { MinecraftVersion, SLOTS } from "../types";
import { RecipeFormatter } from "./format/types";
import { formatIngredient } from "./ingredient";
import { CraftingTransmuteRecipe, TransmuteInput } from "./recipes/types";
import { isVersionAtLeast } from "./version-utils";

export const validateTransmute = (state: Recipe): string[] => {
  const errors: string[] = [];

  if (!state.slots[SLOTS.crafting.slot1]) {
    errors.push("Add an input item");
  }

  if (!state.slots[SLOTS.crafting.slot2]) {
    errors.push("Add a material item");
  }

  if (!state.slots[SLOTS.crafting.result]) {
    errors.push("Add a result item");
  }

  return errors;
};

export const buildJava = ({
  state,
  formatter,
  version,
  slotContext = createEmptySlotContext(version),
}: {
  state: TransmuteInput;
  formatter: RecipeFormatter;
  version: MinecraftVersion;
  slotContext?: SlotContext;
}): CraftingTransmuteRecipe => {
  const group = state.group.length > 0 ? state.group : undefined;
  const input = state.input;
  const material = state.material;
  const result = state.result;

  return {
    type: "minecraft:crafting_transmute",
    ...(isVersionAtLeast(version, MinecraftVersion.V119) && state.category
      ? { category: state.category }
      : {}),
    ...(group ? { group } : {}),
    input: formatIngredient({ item: input, formatter, slotContext }),
    material: formatIngredient({ item: material, formatter, slotContext }),
    result: result
      ? formatter.objectResult(getRequiredSlotIdentifier(result, slotContext), getSlotCount(result))
      : {},
  } satisfies CraftingTransmuteRecipe;
};

export const generate = ({
  state,
  version,
  formatter,
  slotContext = createEmptySlotContext(version),
}: {
  state: Recipe;
  version: MinecraftVersion;
  formatter: RecipeFormatter;
  slotContext?: SlotContext;
}) => {
  return buildJava({
    state: {
      input: state.slots[SLOTS.crafting.slot1],
      material: state.slots[SLOTS.crafting.slot2],
      result: state.slots[SLOTS.crafting.result],
      group: state.group,
      category: state.category || undefined,
    },
    formatter,
    version,
    slotContext,
  });
};
