import { RecipeSliceState } from "@/store/slices/recipeSlice";

import { getItemOutputFormatterForVersion } from "./shared";
import {
  MinecraftVersion,
  RecipeType,
  SmithingRecipe,
  SmithingRecipe116Format,
  SmithingRecipeTransform119Format,
  SmithingRecipeTrim119Format,
} from "../types";

export function generate(
  recipeSlice: RecipeSliceState,
  version: MinecraftVersion,
): object {
  const outputFormatter = getItemOutputFormatterForVersion(version);

  const templateItem = recipeSlice.slots["smithing.template"];
  const baseItem = recipeSlice.slots["smithing.base"];
  const additionItem = recipeSlice.slots["smithing.addition"];
  const resultItem = recipeSlice.slots["smithing.result"];

  const constantFields: Pick<SmithingRecipe, "base" | "addition"> = {
    base: baseItem ? outputFormatter(baseItem, false) : {},
    addition: additionItem ? outputFormatter(additionItem, false) : {},
  };

  const result = resultItem ? outputFormatter(resultItem, false) : {};
  const template = templateItem ? outputFormatter(templateItem, false) : {};

  if (
    version === MinecraftVersion.V116 ||
    recipeSlice.recipeType === RecipeType.Smithing
  ) {
    return {
      type: "minecraft:smithing",
      result,
      ...constantFields,
    } satisfies SmithingRecipe116Format;
  } else {
    if (recipeSlice.recipeType === RecipeType.SmithingTrim) {
      return {
        type: "minecraft:smithing_trim",
        template,
        ...constantFields,
      } satisfies SmithingRecipeTrim119Format;
    } else {
      return {
        type: "minecraft:smithing_transform",
        template,
        result,
        ...constantFields,
      } satisfies SmithingRecipeTransform119Format;
    }
  }
}
