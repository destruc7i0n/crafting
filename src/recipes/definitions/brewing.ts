import { RecipeType } from "@/data/types";
import { BedrockFormatVersion } from "@/recipes/generate/types";
import { SLOTS } from "@/recipes/slots";
import { recipeTypeAvailability } from "@/versioning";

import { BedrockOnlyRecipeDefinition, RecipeDefinitionSlots } from "./types";

const BEDROCK_FORMAT_VERSION: BedrockFormatVersion = "1.20.10";

const brewingSlots = {
  getAutoPlace: () => [SLOTS.brewing.reagent, SLOTS.brewing.input, SLOTS.brewing.result],
  resultSlots: [SLOTS.brewing.result],
  canEditCount: () => false,
  isDisabled: () => false,
} satisfies RecipeDefinitionSlots;

const createBrewingDefinition = ({
  type,
  label,
}: {
  type: RecipeType.BrewingContainer | RecipeType.BrewingMix;
  label: string;
}): BedrockOnlyRecipeDefinition => ({
  type,
  label,
  iconItemId: "minecraft:brewing_stand",
  previewKind: "brewing",
  availability: recipeTypeAvailability[type],
  slots: brewingSlots,
  naming: {
    resultSlot: SLOTS.brewing.result,
    sidebarFallbackLabel: `${label} Recipe`,
    getAutoNames: () => ["brewing_recipe"],
  },
  validate: () => [],
  generateBedrock: () => {
    throw new Error("Brewing recipes are not supported yet.");
  },
  getBedrockMeta: () => ({
    wrapperKey:
      type === RecipeType.BrewingContainer
        ? "minecraft:recipe_brewing_container"
        : "minecraft:recipe_brewing_mix",
    tags: ["brewing_stand"],
    formatVersion: BEDROCK_FORMAT_VERSION,
  }),
});

export const brewingContainerDefinition = createBrewingDefinition({
  type: RecipeType.BrewingContainer,
  label: "Brewing Container",
});

export const brewingMixDefinition = createBrewingDefinition({
  type: RecipeType.BrewingMix,
  label: "Brewing Mix",
});
