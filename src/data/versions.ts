import { MinecraftVersion, RecipeType } from "./types";

export const getSupportedRecipeTypesForVersion = (
  version: MinecraftVersion,
): RecipeType[] => {
  switch (version) {
    case MinecraftVersion.V112:
      return [RecipeType.Crafting];
    case MinecraftVersion.V113:
      return [RecipeType.Crafting, RecipeType.Smelting];
    case MinecraftVersion.V114:
      return [
        RecipeType.Blasting,
        RecipeType.CampfireCooking,
        RecipeType.Crafting,
        RecipeType.Smelting,
        RecipeType.Smoking,
        RecipeType.Stonecutter,
      ];
    case MinecraftVersion.V116:
    case MinecraftVersion.V117:
    case MinecraftVersion.V118:
      return [
        RecipeType.Blasting,
        RecipeType.CampfireCooking,
        RecipeType.Crafting,
        RecipeType.Smelting,
        RecipeType.Smoking,
        RecipeType.Stonecutter,
        RecipeType.Smithing,
      ];
    default:
      return [
        RecipeType.Blasting,
        RecipeType.CampfireCooking,
        RecipeType.Crafting,
        RecipeType.Smelting,
        RecipeType.Smoking,
        RecipeType.Stonecutter,
        RecipeType.SmithingTransform,
        RecipeType.SmithingTrim,
      ];
  }
};
