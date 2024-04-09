import { RecipeSliceState } from "@/store/slices/recipeSlice";

import { getItemOutputFormatterForVersion } from "./shared";
import { recipeTypeToJavaType } from "../constants";
import {
  CookingRecipe,
  CookingRecipe113Format,
  CookingRecipe114Format,
  MinecraftVersion,
} from "../types";

export function generate(
  recipeSlice: RecipeSliceState,
  version: MinecraftVersion,
): object {
  const group = recipeSlice.group.length > 0 ? recipeSlice.group : undefined;

  const input = recipeSlice.slots["cooking.ingredient"];
  const output = recipeSlice.slots["cooking.result"];

  const itemFormatter = getItemOutputFormatterForVersion(version);

  const constantFields: Pick<
    CookingRecipe,
    "group" | "experience" | "cookingtime" | "ingredient" | "result"
  > = {
    group,
    experience:
      recipeSlice.cooking.experience > 0
        ? recipeSlice.cooking.experience
        : undefined,
    cookingtime:
      recipeSlice.cooking.time > 0 ? recipeSlice.cooking.time : undefined,

    ingredient: input ? itemFormatter(input, false) : {},
    result: output ? output.id.toString() : "",
  };

  if (version === MinecraftVersion.V113) {
    return {
      type: "smelting",
      ...constantFields,
    } satisfies CookingRecipe113Format;
  } else {
    return {
      type: recipeTypeToJavaType[recipeSlice.recipeType],
      ...constantFields,
    } satisfies CookingRecipe114Format;
  }
}
