export enum MinecraftVersion {
  Bedrock = "bedrock",
  V112 = "1.12",
  V113 = "1.13",
  V114 = "1.14",
  V115 = "1.15",
  V116 = "1.16",
  V117 = "1.17",
  V118 = "1.18",
  V119 = "1.19",
  V120 = "1.20",
  V121 = "1.21",
  V1212 = "1.21.2",
  V1214 = "1.21.4",
  V1215 = "1.21.5",
  V1216 = "1.21.6",
  V1217 = "1.21.7",
  V1219 = "1.21.9",
  V12111 = "1.21.11",
}

export enum RecipeType {
  Crafting = "crafting",
  CraftingTransmute = "crafting_transmute",

  Smelting = "smelting",
  CampfireCooking = "campfire_cooking",
  Blasting = "blasting",
  Smoking = "smoking",

  Stonecutter = "stonecutter",

  Smithing = "smithing",
  SmithingTrim = "smithing_trim",
  SmithingTransform = "smithing_transform",

  BrewingContainer = "brewing_container",
  BrewingMix = "brewing_mix",
}

// Store Types

type CraftingSlots =
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
type CookingSlots = "cooking.ingredient" | "cooking.result";
type SmithingSlots =
  | "smithing.template"
  | "smithing.base"
  | "smithing.addition"
  | "smithing.result";
type StonecutterSlots = "stonecutter.ingredient" | "stonecutter.result";
type BrewingSlots = "brewing.reagent" | "brewing.input" | "brewing.result";

export type RecipeSlot =
  | CraftingSlots
  | CookingSlots
  | SmithingSlots
  | StonecutterSlots
  | BrewingSlots;

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
  brewing: {
    reagent: "brewing.reagent",
    input: "brewing.input",
    result: "brewing.result",
  },
} as const satisfies Record<string, Record<string, RecipeSlot>>;

export interface OutputTag {
  replace: boolean;
  values: string[];
}
