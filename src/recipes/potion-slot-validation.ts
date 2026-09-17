import { Recipe } from "@/stores/recipe/types";

// brewing slots can remain dormant when switching recipe types
export const getUnsupportedPotionSlotErrors = (recipe: Recipe): string[] =>
  Object.entries(recipe.slots).some(
    ([slot, value]) =>
      !slot.startsWith("brewing.") && value?.kind === "item" && value.potion !== undefined,
  )
    ? ["Potion contents are only supported in brewing slots"]
    : [];
