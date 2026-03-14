import { SingleRecipeState } from "@/stores/recipe";

import { FormatStrategy } from "./format/types";
import { CraftingTransmuteRecipe, TransmuteInput } from "./recipes/types";

export const validateTransmute = (state: SingleRecipeState): string[] => {
  const errors: string[] = [];

  if (!state.slots["crafting.1"]) {
    errors.push("Add an input item");
  }

  if (!state.slots["crafting.2"]) {
    errors.push("Add a material item");
  }

  if (!state.slots["crafting.result"]) {
    errors.push("Add a result item");
  }

  return errors;
};

export const buildJava = (
  state: TransmuteInput,
  formatter: FormatStrategy,
): CraftingTransmuteRecipe => {
  const group = state.group.length > 0 ? state.group : undefined;
  const input = state.input;
  const material = state.material;
  const result = state.result;

  return {
    type: "minecraft:crafting_transmute",
    group,
    input: input ? formatter.ingredient(input.id) : {},
    material: material ? formatter.ingredient(material.id) : {},
    result: result ? formatter.objectResult(result.id, result.count) : {},
  } satisfies CraftingTransmuteRecipe;
};
