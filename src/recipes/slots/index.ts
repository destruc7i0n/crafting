export type CraftingSlots =
  | "crafting.1"
  | "crafting.2"
  | "crafting.3"
  | "crafting.4"
  | "crafting.5"
  | "crafting.6"
  | "crafting.7"
  | "crafting.8"
  | "crafting.9"
  | "crafting.result";

export type CookingSlots = "cooking.ingredient" | "cooking.result";

export type SmithingSlots =
  | "smithing.template"
  | "smithing.base"
  | "smithing.addition"
  | "smithing.result";

export type StonecutterSlots = "stonecutter.ingredient" | "stonecutter.result";

export type RecipeSlot = CraftingSlots | CookingSlots | SmithingSlots | StonecutterSlots;

export const SLOTS = {
  crafting: {
    slot1: "crafting.1",
    slot2: "crafting.2",
    slot3: "crafting.3",
    slot4: "crafting.4",
    slot5: "crafting.5",
    slot6: "crafting.6",
    slot7: "crafting.7",
    slot8: "crafting.8",
    slot9: "crafting.9",
    result: "crafting.result",
  },
  cooking: {
    ingredient: "cooking.ingredient",
    result: "cooking.result",
  },
  smithing: {
    template: "smithing.template",
    base: "smithing.base",
    addition: "smithing.addition",
    result: "smithing.result",
  },
  stonecutter: {
    ingredient: "stonecutter.ingredient",
    result: "stonecutter.result",
  },
} as const satisfies Record<string, Record<string, RecipeSlot>>;
