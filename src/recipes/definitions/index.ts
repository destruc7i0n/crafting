import { MinecraftVersion, RecipeType } from "@/data/types";
import { RecipeSlot } from "@/recipes/slots";
import { isVersionAtLeast } from "@/versioning";

import { brewingContainerDefinition, brewingMixDefinition } from "./brewing";
import {
  blastingDefinition,
  campfireCookingDefinition,
  smeltingDefinition,
  smokingDefinition,
} from "./cooking";
import { craftingDefinition, craftingTransmuteDefinition } from "./crafting";
import {
  smithingDefinition,
  smithingTransformDefinition,
  smithingTrimDefinition,
} from "./smithing";
import { stonecutterDefinition } from "./stonecutter";
import {
  BedrockSupportedRecipeDefinition,
  JavaSupportedRecipeDefinition,
  RecipeDefinition,
} from "./types";

export type {
  BedrockSupportedRecipeDefinition,
  BedrockGenerateArgs,
  GenerateArgs,
  JavaOnlyRecipeDefinition,
  PreviewKind,
  RecipeDefinition,
} from "./types";

export const recipeDefinitions = {
  [RecipeType.Crafting]: craftingDefinition,
  [RecipeType.Smelting]: smeltingDefinition,
  [RecipeType.Blasting]: blastingDefinition,
  [RecipeType.CampfireCooking]: campfireCookingDefinition,
  [RecipeType.Smoking]: smokingDefinition,
  [RecipeType.Stonecutter]: stonecutterDefinition,
  [RecipeType.Smithing]: smithingDefinition,
  [RecipeType.SmithingTransform]: smithingTransformDefinition,
  [RecipeType.SmithingTrim]: smithingTrimDefinition,
  [RecipeType.CraftingTransmute]: craftingTransmuteDefinition,
  [RecipeType.BrewingContainer]: brewingContainerDefinition,
  [RecipeType.BrewingMix]: brewingMixDefinition,
} satisfies Record<RecipeType, RecipeDefinition>;

const recipeDefinitionValues = Object.values(recipeDefinitions);

export const recipeResultSlots = Array.from(
  new Set(recipeDefinitionValues.flatMap((definition) => definition.slots.resultSlots)),
) as RecipeSlot[];

export const getRecipeDefinition = (type: RecipeType) => recipeDefinitions[type];

export const getRecipeTypeLabel = (type: RecipeType) => getRecipeDefinition(type).label;

export const getRecipeTypeIconItemId = (type: RecipeType) => getRecipeDefinition(type).iconItemId;

const supportsBedrock = (
  definition: RecipeDefinition,
): definition is BedrockSupportedRecipeDefinition =>
  typeof definition.generateBedrock === "function" &&
  typeof definition.getBedrockMeta === "function";

const supportsJava = (definition: RecipeDefinition): definition is JavaSupportedRecipeDefinition =>
  typeof definition.generateJava === "function";

export function isRecipeTypeSupported(
  definition: RecipeDefinition,
  version: MinecraftVersion.Bedrock,
): definition is BedrockSupportedRecipeDefinition;
export function isRecipeTypeSupported(
  definition: RecipeDefinition,
  version: Exclude<MinecraftVersion, MinecraftVersion.Bedrock>,
): definition is JavaSupportedRecipeDefinition;
export function isRecipeTypeSupported(
  definition: RecipeDefinition,
  version: MinecraftVersion,
): boolean;
export function isRecipeTypeSupported(definition: RecipeDefinition, version: MinecraftVersion) {
  if (definition.availability.enabled === false) {
    return false;
  }

  if (version === MinecraftVersion.Bedrock) {
    return supportsBedrock(definition);
  }

  if (!supportsJava(definition)) {
    return false;
  }

  if (!isVersionAtLeast(version, definition.availability.minVersion)) {
    return false;
  }

  if (
    definition.availability.maxVersion &&
    !isVersionAtLeast(definition.availability.maxVersion, version)
  ) {
    return false;
  }

  return true;
}

export const getSupportedRecipeTypesForVersion = (version: MinecraftVersion): RecipeType[] =>
  recipeDefinitionValues
    .filter((definition) => isRecipeTypeSupported(definition, version))
    .map((definition) => definition.type);

export const coerceRecipeTypeForVersion = (
  recipeType: RecipeType | undefined,
  version: MinecraftVersion,
): RecipeType => {
  const supportedRecipeTypes = getSupportedRecipeTypesForVersion(version);

  if (recipeType && supportedRecipeTypes.includes(recipeType)) {
    return recipeType;
  }

  return supportedRecipeTypes[0] ?? RecipeType.Crafting;
};
