import { MinecraftVersion, RecipeSlot, RecipeType } from "@/data/types";
import { isVersionAtLeast } from "@/recipes/versioning";

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
import { RecipeDefinition } from "./types";

export type {
  BedrockGenerateArgs,
  GenerateArgs,
  PreviewKind,
  RecipeDefinition,
  RecipeTypeAvailability,
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
} satisfies Record<RecipeType, RecipeDefinition>;

const recipeDefinitionValues = Object.values(recipeDefinitions);

export const recipeResultSlots = Array.from(
  new Set(recipeDefinitionValues.flatMap((definition) => definition.slots.resultSlots)),
) as RecipeSlot[];

export const getRecipeDefinition = (type: RecipeType) => recipeDefinitions[type];

export const getRecipeTypeLabel = (type: RecipeType) => getRecipeDefinition(type).label;

export const getRecipeTypeIconItemId = (type: RecipeType) => getRecipeDefinition(type).iconItemId;

export const isRecipeTypeSupported = (definition: RecipeDefinition, version: MinecraftVersion) => {
  if (definition.availability.enabled === false) {
    return false;
  }

  if (version === MinecraftVersion.Bedrock) {
    return definition.availability.bedrock;
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
};

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
