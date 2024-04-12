import { SingleRecipeState } from "@/stores/recipe";

import { getItemOutputFormatterForVersion } from "./shared";
import { MinecraftVersion, StonecuttingRecipe114Format } from "../types";

export function generate(
  state: SingleRecipeState,
  version: MinecraftVersion,
): object {
  const outputFormatter = getItemOutputFormatterForVersion(version);

  return {
    type: "minecraft:stonecutting",
    group: state.group.length > 0 ? state.group : undefined,
    ingredient: state.slots["stonecutter.ingredient"]
      ? outputFormatter(state.slots["stonecutter.ingredient"], false)
      : {},
    result: state.slots["stonecutter.result"]?.id.raw ?? "",
    count: state.slots["stonecutter.result"]?.count ?? 1,
  } satisfies StonecuttingRecipe114Format;
}
