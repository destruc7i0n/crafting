import { SingleRecipeState } from "@/stores/recipe";

import { get113ItemOutputFormat, get121ItemOutputFormat } from "./shared";
import { recipeTypeToJavaType } from "../constants";
import {
  CookingRecipe113Format,
  CookingRecipe114Format,
  CookingRecipe121Format,
  MinecraftVersion,
} from "../types";

export function generate(
  state: SingleRecipeState,
  version: MinecraftVersion,
): object {
  const group = state.group.length > 0 ? state.group : undefined;

  const input = state.slots["cooking.ingredient"];
  const output = state.slots["cooking.result"];

  const constantFields: Pick<
    CookingRecipe113Format,
    "group" | "experience" | "cookingtime"
  > = {
    group,
    experience:
      state.cooking.experience > 0 ? state.cooking.experience : undefined,
    cookingtime: state.cooking.time > 0 ? state.cooking.time : undefined,
  };

  switch (version) {
    case MinecraftVersion.V113:
      return {
        type: "smelting",
        ...constantFields,
        ingredient: input ? get113ItemOutputFormat(input, false) : {},
        result: output?.id.raw ?? "",
      } satisfies CookingRecipe113Format;
    case MinecraftVersion.V114:
    case MinecraftVersion.V115:
    case MinecraftVersion.V116:
    case MinecraftVersion.V117:
    case MinecraftVersion.V118:
    case MinecraftVersion.V119:
    case MinecraftVersion.V120:
      return {
        type: recipeTypeToJavaType[state.recipeType],
        ...constantFields,
        ingredient: input ? get113ItemOutputFormat(input, false) : {},
        result: output?.id.raw ?? "",
      } satisfies CookingRecipe114Format;
    case MinecraftVersion.V121:
      return {
        type: recipeTypeToJavaType[state.recipeType],
        ...constantFields,
        ingredient: input ? get113ItemOutputFormat(input, false) : {},
        result: output ? get121ItemOutputFormat(output, false) : {},
      } satisfies CookingRecipe121Format;
    default:
      return {};
  }
}
