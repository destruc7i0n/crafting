import { SingleRecipeState } from "@/stores/recipe";

import { formatIngredient } from "./ingredient";
import { FormatStrategy } from "./format/types";
import { isVersionAtLeast } from "./version-utils";
import { MinecraftVersion } from "../types";
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
  version: MinecraftVersion,
): CraftingTransmuteRecipe => {
  const group = state.group.length > 0 ? state.group : undefined;
  const input = state.input;
  const material = state.material;
  const result = state.result;

  return {
    type: "minecraft:crafting_transmute",
    ...(isVersionAtLeast(version, MinecraftVersion.V119)
      ? { category: state.category ?? "misc" }
      : {}),
    ...(group ? { group } : {}),
    input: formatIngredient(input, formatter),
    material: formatIngredient(material, formatter),
    result: result ? formatter.objectResult(result.id, result.count) : {},
  } satisfies CraftingTransmuteRecipe;
};
