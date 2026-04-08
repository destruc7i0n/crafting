import { MinecraftVersion, RecipeType, SLOTS } from "@/data/types";
import {
  buildBedrock as buildBedrockCooking,
  buildJava as buildJavaCooking,
  extractCookingInput,
  validateCooking,
} from "@/recipes/generate/cooking";
import { BedrockFormatVersion, BedrockTag } from "@/recipes/generate/types";

import { getCookingAutoNames } from "./auto-naming";
import { RecipeDefinition } from "./types";

const BEDROCK_FORMAT_VERSION: BedrockFormatVersion = "1.20.10";

const cookingSlots = {
  getAutoPlace: () => [SLOTS.cooking.ingredient, SLOTS.cooking.result],
  resultSlots: [SLOTS.cooking.result],
  canEditCount: () => false,
  isDisabled: () => false,
} satisfies RecipeDefinition["slots"];

const createCookingDefinition = ({
  type,
  label,
  iconItemId,
  minVersion,
  bedrockTags,
}: {
  type: RecipeType.Smelting | RecipeType.Blasting | RecipeType.CampfireCooking | RecipeType.Smoking;
  label: string;
  iconItemId: string;
  minVersion: MinecraftVersion;
  bedrockTags: BedrockTag[];
}): RecipeDefinition => ({
  type,
  family: "cooking",
  label,
  iconItemId,
  previewKind: "furnace",
  availability: { minVersion, bedrock: true },
  slots: cookingSlots,
  naming: {
    resultSlot: SLOTS.cooking.result,
    sidebarFallbackLabel: `${label} Recipe`,
    getAutoNames: getCookingAutoNames,
  },
  validate: (recipe, version) => validateCooking(recipe, version),
  generateJava: ({ recipe, formatter, version, slotContext }) =>
    buildJavaCooking({
      state: extractCookingInput(recipe),
      formatter,
      version,
      slotContext,
    }),
  generateBedrock: ({ recipe, slotContext }) =>
    buildBedrockCooking(extractCookingInput(recipe), slotContext),
  getBedrockMeta: () => ({
    wrapperKey: "minecraft:recipe_furnace",
    tags: bedrockTags,
    formatVersion: BEDROCK_FORMAT_VERSION,
  }),
});

export const smeltingDefinition = createCookingDefinition({
  type: RecipeType.Smelting,
  label: "Smelting",
  iconItemId: "minecraft:furnace",
  minVersion: MinecraftVersion.V113,
  bedrockTags: ["furnace"],
});

export const blastingDefinition = createCookingDefinition({
  type: RecipeType.Blasting,
  label: "Blasting",
  iconItemId: "minecraft:blast_furnace",
  minVersion: MinecraftVersion.V114,
  bedrockTags: ["blast_furnace"],
});

export const campfireCookingDefinition = createCookingDefinition({
  type: RecipeType.CampfireCooking,
  label: "Campfire Cooking",
  iconItemId: "minecraft:campfire",
  minVersion: MinecraftVersion.V114,
  bedrockTags: ["campfire", "soul_campfire"],
});

export const smokingDefinition = createCookingDefinition({
  type: RecipeType.Smoking,
  label: "Smoking",
  iconItemId: "minecraft:smoker",
  minVersion: MinecraftVersion.V114,
  bedrockTags: ["smoker"],
});
