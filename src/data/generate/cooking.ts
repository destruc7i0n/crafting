import { SingleRecipeState } from "@/stores/recipe";

import { getItemOutputFormatterForVersion } from "./shared";
import { recipeTypeToJavaType } from "../constants";
import {
  CookingRecipe,
  CookingRecipe113Format,
  CookingRecipe114Format,
  MinecraftVersion,
} from "../types";

export function generate(
  state: SingleRecipeState,
  version: MinecraftVersion,
): object {
  const group = state.group.length > 0 ? state.group : undefined;

  const input = state.slots["cooking.ingredient"];
  const output = state.slots["cooking.result"];

  const itemFormatter = getItemOutputFormatterForVersion(version);

  const constantFields: Pick<
    CookingRecipe,
    "group" | "experience" | "cookingtime" | "ingredient" | "result"
  > = {
    group,
    experience:
      state.cooking.experience > 0 ? state.cooking.experience : undefined,
    cookingtime: state.cooking.time > 0 ? state.cooking.time : undefined,

    ingredient: input ? itemFormatter(input, false) : {},
    result: output ? output.id.raw : "",
  };

  if (version === MinecraftVersion.V113) {
    return {
      type: "smelting",
      ...constantFields,
    } satisfies CookingRecipe113Format;
  } else {
    return {
      type: recipeTypeToJavaType[state.recipeType],
      ...constantFields,
    } satisfies CookingRecipe114Format;
  }
}
