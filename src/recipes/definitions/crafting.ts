import {
  buildBedrock as buildBedrockCrafting,
  buildJava as buildJavaCrafting,
  extractCraftingInput,
  validateCrafting,
} from "@/data/generate/crafting";
import { BedrockFormatVersion, BedrockRecipeMeta } from "@/data/generate/recipes/types";
import {
  buildJava as buildJavaTransmute,
  extractTransmuteInput,
  validateTransmute,
} from "@/data/generate/transmute";
import { MinecraftVersion, RecipeSlot, RecipeType, SLOTS } from "@/data/types";
import { Recipe } from "@/stores/recipe/types";

import { getCraftingAutoNames, getTransmuteAutoNames } from "./naming";
import { RecipeDefinition } from "./types";

const BEDROCK_FORMAT_VERSION: BedrockFormatVersion = "1.20.10";

const disabledTwoByTwoSlots = new Set<RecipeSlot>([
  SLOTS.crafting.slot3,
  SLOTS.crafting.slot6,
  SLOTS.crafting.slot7,
  SLOTS.crafting.slot8,
  SLOTS.crafting.slot9,
]);

const canEditResultCount = (editableResultSlot: RecipeSlot) => (slot: RecipeSlot) =>
  slot === editableResultSlot;

const fullCraftingAutoPlace = [
  SLOTS.crafting.slot1,
  SLOTS.crafting.slot2,
  SLOTS.crafting.slot3,
  SLOTS.crafting.slot4,
  SLOTS.crafting.slot5,
  SLOTS.crafting.slot6,
  SLOTS.crafting.slot7,
  SLOTS.crafting.slot8,
  SLOTS.crafting.slot9,
  SLOTS.crafting.result,
] satisfies RecipeSlot[];

const twoByTwoCraftingAutoPlace = [
  SLOTS.crafting.slot1,
  SLOTS.crafting.slot2,
  SLOTS.crafting.slot4,
  SLOTS.crafting.slot5,
  SLOTS.crafting.result,
] satisfies RecipeSlot[];

const isCraftingSlotDisabled = (recipe: Recipe, slot: RecipeSlot) =>
  recipe.recipeType === RecipeType.Crafting &&
  recipe.crafting.twoByTwo &&
  disabledTwoByTwoSlots.has(slot);

const craftingResultSlots = [SLOTS.crafting.result];

const getCraftingBedrockMeta = (recipe: Recipe): BedrockRecipeMeta => ({
  wrapperKey: recipe.crafting.shapeless ? "minecraft:recipe_shapeless" : "minecraft:recipe_shaped",
  tags: ["crafting_table"],
  formatVersion: BEDROCK_FORMAT_VERSION,
});

export const craftingDefinition: RecipeDefinition = {
  type: RecipeType.Crafting,
  family: "crafting",
  label: "Crafting",
  iconItemId: "minecraft:crafting_table",
  previewKind: "crafting",
  availability: { minVersion: MinecraftVersion.V112, bedrock: true },
  slots: {
    getAutoPlace: (recipe) =>
      recipe.crafting.twoByTwo ? twoByTwoCraftingAutoPlace : fullCraftingAutoPlace,
    resultSlots: craftingResultSlots,
    canEditCount: canEditResultCount(SLOTS.crafting.result),
    isDisabled: isCraftingSlotDisabled,
  },
  naming: {
    resultSlot: SLOTS.crafting.result,
    sidebarFallbackLabel: "Crafting Recipe",
    getAutoNames: getCraftingAutoNames,
  },
  validate: (recipe) => validateCrafting(recipe),
  generateJava: ({ recipe, formatter, version, slotContext }) =>
    buildJavaCrafting({
      state: extractCraftingInput(recipe),
      formatter,
      version,
      slotContext,
    }),
  generateBedrock: ({ recipe, formatter, slotContext }) =>
    buildBedrockCrafting(extractCraftingInput(recipe), formatter, slotContext),
  getBedrockMeta: getCraftingBedrockMeta,
};

export const craftingTransmuteDefinition: RecipeDefinition = {
  type: RecipeType.CraftingTransmute,
  family: "crafting",
  label: "Crafting Transmute",
  iconItemId: "minecraft:crafting_table",
  availability: {
    minVersion: MinecraftVersion.V1212,
    bedrock: false,
    enabled: false,
  },
  slots: {
    getAutoPlace: () => [SLOTS.crafting.slot1, SLOTS.crafting.slot2, SLOTS.crafting.result],
    resultSlots: craftingResultSlots,
    canEditCount: () => false,
    isDisabled: () => false,
  },
  naming: {
    resultSlot: SLOTS.crafting.result,
    sidebarFallbackLabel: "Crafting Transmute Recipe",
    getAutoNames: getTransmuteAutoNames,
  },
  validate: (recipe) => validateTransmute(recipe),
  generateJava: ({ recipe, formatter, version, slotContext }) =>
    buildJavaTransmute({
      state: extractTransmuteInput(recipe),
      formatter,
      version,
      slotContext,
    }),
};
