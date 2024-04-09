import { RecipeSliceState } from "@/store/slices/recipeSlice";

import { getItemOutputFormatterForVersion } from "./shared";
import { MinecraftVersion, StonecuttingRecipe114Format } from "../types";

export function generate(
  recipeSlice: RecipeSliceState,
  version: MinecraftVersion,
): object {
  const outputFormatter = getItemOutputFormatterForVersion(version);

  return {
    type: "minecraft:stonecutting",
    group: recipeSlice.group.length > 0 ? recipeSlice.group : undefined,
    ingredient: outputFormatter(
      recipeSlice.slots["stonecutting.ingredient"]!,
      false,
    ),
    result: recipeSlice.slots["stonecutting.result"]?.id.toString() ?? "",
    count: recipeSlice.slots["stonecutting.result"]?.count ?? 1,
  } satisfies StonecuttingRecipe114Format;
}
