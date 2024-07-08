import { SingleRecipeState } from "@/stores/recipe";

import { generate as generateCooking } from "./cooking";
import { generate as generateCrafting } from "./crafting";
import { generate as generateSmithing } from "./smithing";
import { generate as generateStonecutter } from "./stonecutter";
import { MinecraftVersion, RecipeType } from "../types";

export function generate(
  state: SingleRecipeState,
  version: MinecraftVersion,
): object {
  switch (state.recipeType) {
    case RecipeType.Crafting:
      return generateCrafting(state, version);
    case RecipeType.Smelting:
    case RecipeType.Blasting:
    case RecipeType.Smoking:
    case RecipeType.CampfireCooking:
      return generateCooking(state, version);
    case RecipeType.Smithing:
    case RecipeType.SmithingTransform:
    case RecipeType.SmithingTrim:
      return generateSmithing(state, version);
    case RecipeType.Stonecutter:
      return generateStonecutter(state, version);
    default:
      return {};
  }
}
