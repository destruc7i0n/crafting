import { RecipeType } from "@/data/types";
import {
  buildBedrock as buildBedrockCrafting,
  buildJava as buildJavaCrafting,
  extractCraftingInput,
  validateCrafting,
} from "@/recipes/generate/crafting";
import {
  buildJava as buildJavaTransmute,
  extractTransmuteInput,
  validateTransmute,
} from "@/recipes/generate/transmute";
import { BedrockFormatVersion, BedrockRecipeMeta } from "@/recipes/generate/types";
import { RecipeSlot, SLOTS } from "@/recipes/slots";
import { Recipe } from "@/stores/recipe/types";
import { recipeTypeAvailability } from "@/versioning";

import { getCraftingAutoNames, getTransmuteAutoNames } from "./auto-naming";
import { BedrockSupportedRecipeDefinition, JavaOnlyRecipeDefinition } from "./types";

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
  supportsPriority: true,
});

export const craftingDefinition: BedrockSupportedRecipeDefinition = {
  type: RecipeType.Crafting,
  family: "crafting",
  label: "Crafting",
  iconItemId: "minecraft:crafting_table",
  previewKind: "crafting",
  availability: recipeTypeAvailability[RecipeType.Crafting],
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

export const craftingTransmuteDefinition: JavaOnlyRecipeDefinition = {
  type: RecipeType.CraftingTransmute,
  family: "crafting",
  label: "Crafting Transmute",
  iconItemId: "minecraft:crafting_table",
  availability: recipeTypeAvailability[RecipeType.CraftingTransmute],
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
