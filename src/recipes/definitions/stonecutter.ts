import { BedrockFormatVersion } from "@/data/generate/recipes/types";
import {
  buildBedrock as buildBedrockStonecutter,
  buildJava as buildJavaStonecutter,
  extractStonecutterInput,
  validateStonecutter,
} from "@/data/generate/stonecutter";
import { MinecraftVersion, RecipeType, SLOTS } from "@/data/types";

import { getStonecuttingAutoNames } from "./naming";
import { RecipeDefinition } from "./types";

const BEDROCK_FORMAT_VERSION: BedrockFormatVersion = "1.20.10";

export const stonecutterDefinition: RecipeDefinition = {
  type: RecipeType.Stonecutter,
  family: "stonecutter",
  label: "Stonecutting",
  iconItemId: "minecraft:stonecutter",
  previewKind: "stonecutter",
  availability: { minVersion: MinecraftVersion.V114, bedrock: true },
  slots: {
    getAutoPlace: () => [SLOTS.stonecutter.ingredient, SLOTS.stonecutter.result],
    resultSlots: [SLOTS.stonecutter.result],
    canEditCount: (slot) => slot === SLOTS.stonecutter.result,
    isDisabled: () => false,
  },
  naming: {
    resultSlot: SLOTS.stonecutter.result,
    sidebarFallbackLabel: "Stonecutting Recipe",
    getAutoNames: getStonecuttingAutoNames,
  },
  validate: (recipe) => validateStonecutter(recipe),
  generateJava: ({ recipe, formatter, version, slotContext }) =>
    buildJavaStonecutter({
      state: extractStonecutterInput(recipe),
      formatter,
      version,
      slotContext,
    }),
  generateBedrock: ({ recipe, formatter, slotContext }) =>
    buildBedrockStonecutter(extractStonecutterInput(recipe), formatter, slotContext),
  getBedrockMeta: () => ({
    wrapperKey: "minecraft:recipe_shapeless",
    tags: ["stonecutter"],
    formatVersion: BEDROCK_FORMAT_VERSION,
  }),
};
