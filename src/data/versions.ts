import { isVersionAtLeast } from "./generate/version-utils";
import { MinecraftVersion, RecipeType } from "./types";

interface RecipeTypeAvailability {
  type: RecipeType;
  minVersion: MinecraftVersion;
  maxVersion?: MinecraftVersion;
  bedrock: boolean;
}

const RECIPE_TYPE_AVAILABILITY: RecipeTypeAvailability[] = [
  { type: RecipeType.Crafting, minVersion: MinecraftVersion.V112, bedrock: true },
  { type: RecipeType.Smelting, minVersion: MinecraftVersion.V113, bedrock: true },
  { type: RecipeType.Blasting, minVersion: MinecraftVersion.V114, bedrock: true },
  { type: RecipeType.CampfireCooking, minVersion: MinecraftVersion.V114, bedrock: true },
  { type: RecipeType.Smoking, minVersion: MinecraftVersion.V114, bedrock: true },
  { type: RecipeType.Stonecutter, minVersion: MinecraftVersion.V114, bedrock: true },
  {
    type: RecipeType.Smithing,
    minVersion: MinecraftVersion.V116,
    maxVersion: MinecraftVersion.V118,
    bedrock: false,
  },
  { type: RecipeType.SmithingTransform, minVersion: MinecraftVersion.V119, bedrock: true },
  { type: RecipeType.SmithingTrim, minVersion: MinecraftVersion.V119, bedrock: true },
  // { type: RecipeType.CraftingTransmute, minVersion: MinecraftVersion.V1212, bedrock: false },
];

const BEDROCK_ONLY_RECIPE_TYPES: RecipeType[] = [
  RecipeType.BrewingContainer,
  RecipeType.BrewingMix,
];

export const getSupportedRecipeTypesForVersion = (version: MinecraftVersion): RecipeType[] => {
  if (version === MinecraftVersion.Bedrock) {
    return [
      ...RECIPE_TYPE_AVAILABILITY.filter((entry) => entry.bedrock).map((entry) => entry.type),
      ...BEDROCK_ONLY_RECIPE_TYPES,
    ];
  }

  return RECIPE_TYPE_AVAILABILITY.filter((entry) => {
    if (!isVersionAtLeast(version, entry.minVersion)) return false;
    if (entry.maxVersion && !isVersionAtLeast(entry.maxVersion, version)) return false;
    return true;
  }).map((entry) => entry.type);
};

export const coerceRecipeTypeForVersion = (
  recipeType: RecipeType | undefined,
  version: MinecraftVersion,
): RecipeType => {
  const supportedRecipeTypes = getSupportedRecipeTypesForVersion(version);

  if (recipeType && supportedRecipeTypes.includes(recipeType)) {
    return recipeType;
  }

  return supportedRecipeTypes[0];
};
