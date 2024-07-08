import { SingleRecipeState } from "@/stores/recipe";

import { get113ItemOutputFormat, get121ItemOutputFormat } from "./shared";
import {
  MinecraftVersion,
  RecipeType,
  SmithingRecipe116Format,
  SmithingRecipeTransform119Format,
  SmithingRecipeTransform121Format,
  SmithingRecipeTrim119Format,
  SmithingRecipeTrim121Format,
} from "../types";

export function generate(
  state: SingleRecipeState,
  version: MinecraftVersion,
): object {
  const templateItem = state.slots["smithing.template"];
  const baseItem = state.slots["smithing.base"];
  const additionItem = state.slots["smithing.addition"];
  const resultItem = state.slots["smithing.result"];

  switch (version) {
    case MinecraftVersion.V116:
    case MinecraftVersion.V117:
    case MinecraftVersion.V118:
      return {
        type: "minecraft:smithing",
        result: resultItem ? get113ItemOutputFormat(resultItem, false) : {},
        base: baseItem ? get113ItemOutputFormat(baseItem, false) : {},
        addition: additionItem
          ? get113ItemOutputFormat(additionItem, false)
          : {},
      } satisfies SmithingRecipe116Format;
    case MinecraftVersion.V119:
    case MinecraftVersion.V120:
      if (state.recipeType === RecipeType.SmithingTrim) {
        return {
          type: "minecraft:smithing_trim",
          template: templateItem
            ? get113ItemOutputFormat(templateItem, false)
            : {},
          base: baseItem ? get113ItemOutputFormat(baseItem, false) : {},
          addition: additionItem
            ? get113ItemOutputFormat(additionItem, false)
            : {},
        } satisfies SmithingRecipeTrim119Format;
      } else {
        return {
          type: "minecraft:smithing_transform",
          template: templateItem
            ? get113ItemOutputFormat(templateItem, false)
            : {},
          base: baseItem ? get113ItemOutputFormat(baseItem, false) : {},
          addition: additionItem
            ? get113ItemOutputFormat(additionItem, false)
            : {},
          result: resultItem ? get113ItemOutputFormat(resultItem, false) : {},
        } satisfies SmithingRecipeTransform119Format;
      }
    case MinecraftVersion.V121:
      if (state.recipeType === RecipeType.SmithingTrim) {
        return {
          type: "minecraft:smithing_trim",
          template: templateItem
            ? get113ItemOutputFormat(templateItem, false)
            : {},
          base: baseItem ? get113ItemOutputFormat(baseItem, false) : {},
          addition: additionItem
            ? get121ItemOutputFormat(additionItem, false)
            : {},
        } satisfies SmithingRecipeTrim121Format;
      } else {
        return {
          type: "minecraft:smithing_transform",
          template: templateItem
            ? get113ItemOutputFormat(templateItem, false)
            : {},
          base: baseItem ? get113ItemOutputFormat(baseItem, false) : {},
          addition: additionItem
            ? get113ItemOutputFormat(additionItem, false)
            : {},
          result: resultItem ? get121ItemOutputFormat(resultItem, false) : {},
        } satisfies SmithingRecipeTransform121Format;
      }
    default:
      return {};
  }
}
