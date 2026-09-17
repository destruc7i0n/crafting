import { RecipeType } from "@/data/types";
import { getBrewingIssues } from "@/recipes/brewing-validation";
import { buildBedrock, buildJava } from "@/recipes/generate/brewing";
import { BedrockFormatVersion } from "@/recipes/generate/types";
import { SLOTS } from "@/recipes/slots";
import { recipeTypeAvailability } from "@/versioning";

import { getBrewingAutoNames } from "./auto-naming";
import {
  BedrockOnlyRecipeDefinition,
  JavaOnlyRecipeDefinition,
  RecipeDefinitionSlots,
} from "./types";

const BEDROCK_FORMAT_VERSION: BedrockFormatVersion = "1.20.10";
const brewingSlots = {
  getAutoPlace: () => [SLOTS.brewing.reagent, SLOTS.brewing.input, SLOTS.brewing.result],
  resultSlots: [SLOTS.brewing.result],
  canEditCount: () => false,
  isDisabled: () => false,
} satisfies RecipeDefinitionSlots;

const javaBrewingDefinition: JavaOnlyRecipeDefinition = {
  type: RecipeType.Brewing,
  label: "Brewing",
  iconItemId: "minecraft:brewing_stand",
  previewKind: "brewing",
  availability: recipeTypeAvailability[RecipeType.Brewing],
  slots: { ...brewingSlots, canEditCount: (slot) => slot === SLOTS.brewing.result },
  naming: {
    resultSlot: SLOTS.brewing.result,
    sidebarFallbackLabel: "Brewing Recipe",
    getAutoNames: getBrewingAutoNames,
  },
  validate: (recipe, version, ctx) =>
    getBrewingIssues(recipe, version, ctx).map((issue) => issue.message),
  generateJava: ({ recipe, version, slotContext }) => buildJava(recipe, version, slotContext),
};

const createBedrockDefinition = (
  type: RecipeType.BrewingContainer | RecipeType.BrewingMix,
  label: string,
): BedrockOnlyRecipeDefinition => ({
  type,
  label,
  iconItemId: "minecraft:brewing_stand",
  previewKind: "brewing",
  availability: recipeTypeAvailability[type],
  slots: brewingSlots,
  naming: {
    resultSlot: SLOTS.brewing.result,
    sidebarFallbackLabel: `${label} Recipe`,
    getAutoNames: getBrewingAutoNames,
  },
  validate: (recipe, version, ctx) =>
    getBrewingIssues(recipe, version, ctx).map((issue) => issue.message),
  generateBedrock: ({ recipe, slotContext }) => buildBedrock(recipe, slotContext),
  getBedrockMeta: () => ({
    wrapperKey:
      type === RecipeType.BrewingContainer
        ? "minecraft:recipe_brewing_container"
        : "minecraft:recipe_brewing_mix",
    tags: ["brewing_stand"],
    formatVersion: BEDROCK_FORMAT_VERSION,
  }),
});

export const brewingDefinition = javaBrewingDefinition;
export const brewingContainerDefinition = createBedrockDefinition(
  RecipeType.BrewingContainer,
  "Brewing Container",
);
export const brewingMixDefinition = createBedrockDefinition(RecipeType.BrewingMix, "Brewing Mix");
