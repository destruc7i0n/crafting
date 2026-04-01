import { SingleRecipeState } from "@/stores/recipe";

import { MinecraftVersion, SLOTS } from "../types";
import { RecipeFormatter } from "./format/types";
import { formatIngredient } from "./ingredient";
import { CraftingTransmuteRecipe, TransmuteInput } from "./recipes/types";
import { isVersionAtLeast } from "./version-utils";

export const validateTransmute = (state: SingleRecipeState): string[] => {
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

export const buildJava = (
  state: TransmuteInput,
  formatter: RecipeFormatter,
  version: MinecraftVersion,
): CraftingTransmuteRecipe => {
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
    input: formatIngredient(input, formatter),
    material: formatIngredient(material, formatter),
    result: result ? formatter.objectResult(result.id, result.count) : {},
  } satisfies CraftingTransmuteRecipe;
};
