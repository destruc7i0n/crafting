import { MinecraftVersion, RecipeType } from "./types";

export const getSupportedRecipeTypesForVersion = (version: MinecraftVersion): RecipeType[] => {
  switch (version) {
    case MinecraftVersion.V112:
      return [RecipeType.Crafting];
    case MinecraftVersion.V113:
      return [RecipeType.Crafting, RecipeType.Smelting];
    case MinecraftVersion.V114:
      return [
        RecipeType.Crafting,
        RecipeType.Smelting,
        RecipeType.Blasting,
        RecipeType.CampfireCooking,
        RecipeType.Smoking,
        RecipeType.Stonecutter,
      ];
    case MinecraftVersion.V115:
    case MinecraftVersion.V116:
    case MinecraftVersion.V117:
    case MinecraftVersion.V118:
      return [
        RecipeType.Crafting,
        RecipeType.Smelting,
        RecipeType.Blasting,
        RecipeType.CampfireCooking,
        RecipeType.Smoking,
        RecipeType.Stonecutter,
        RecipeType.Smithing,
      ];
    case MinecraftVersion.V119:
    case MinecraftVersion.V120:
    case MinecraftVersion.V121:
      return [
        RecipeType.Crafting,
        RecipeType.Smelting,
        RecipeType.Blasting,
        RecipeType.CampfireCooking,
        RecipeType.Smoking,
        RecipeType.Stonecutter,
        RecipeType.SmithingTransform,
        RecipeType.SmithingTrim,
      ];
    case MinecraftVersion.V1212:
    case MinecraftVersion.V1214:
    case MinecraftVersion.V1215:
    case MinecraftVersion.V1216:
    case MinecraftVersion.V1217:
    case MinecraftVersion.V1219:
    case MinecraftVersion.V12111:
      return [
        RecipeType.Crafting,
        RecipeType.Smelting,
        RecipeType.Blasting,
        RecipeType.CampfireCooking,
        RecipeType.Smoking,
        RecipeType.Stonecutter,
        RecipeType.SmithingTransform,
        RecipeType.SmithingTrim,
      ];
    case MinecraftVersion.Bedrock:
      return [
        RecipeType.Crafting,
        RecipeType.Smelting,
        RecipeType.Blasting,
        RecipeType.CampfireCooking,
        RecipeType.Smoking,
        RecipeType.Stonecutter,
        RecipeType.SmithingTransform,
        RecipeType.SmithingTrim,
      ];
  }
};
