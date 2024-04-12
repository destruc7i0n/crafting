import { SingleRecipeState } from "@/stores/recipe";

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
  state: SingleRecipeState,
  version: MinecraftVersion,
): object {
  const outputFormatter = getItemOutputFormatterForVersion(version);

  const templateItem = state.slots["smithing.template"];
  const baseItem = state.slots["smithing.base"];
  const additionItem = state.slots["smithing.addition"];
  const resultItem = state.slots["smithing.result"];

  const constantFields: Pick<SmithingRecipe, "base" | "addition"> = {
    base: baseItem ? outputFormatter(baseItem, false) : {},
    addition: additionItem ? outputFormatter(additionItem, false) : {},
  };

  const result = resultItem ? outputFormatter(resultItem, false) : {};
  const template = templateItem ? outputFormatter(templateItem, false) : {};

  if (
    version === MinecraftVersion.V116 ||
    state.recipeType === RecipeType.Smithing
  ) {
    return {
      type: "minecraft:smithing",
      result,
      ...constantFields,
    } satisfies SmithingRecipe116Format;
  } else {
    if (state.recipeType === RecipeType.SmithingTrim) {
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
