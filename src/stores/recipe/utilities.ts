import { generateUid } from "@/lib/utils";

import { cloneRecipeSlotValue } from "./slot-value";

import type { Recipe } from "./types";

export const cloneRecipe = (recipe: Recipe): Recipe => ({
  ...recipe,
  id: generateUid("recipe"),
  nameMode: "auto",
  name: "",
  slots: Object.fromEntries(
    Object.entries(recipe.slots)
      .map(([slot, value]) => [slot, value ? cloneRecipeSlotValue(value) : undefined])
      .filter(([, value]) => value !== undefined),
  ),
  smithing: { ...recipe.smithing },
  crafting: { ...recipe.crafting },
  cooking: { ...recipe.cooking },
  bedrock: {
    ...recipe.bedrock,
    identifierMode: "auto",
    identifierName: "",
  },
});
