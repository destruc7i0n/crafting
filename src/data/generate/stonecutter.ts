import { SingleRecipeState } from "@/stores/recipe";

import { get113ItemOutputFormat, get121ItemOutputFormat } from "./shared";
import {
  MinecraftVersion,
  StonecuttingRecipe114Format,
  StonecuttingRecipe121Format,
} from "../types";

export function generate(
  state: SingleRecipeState,
  version: MinecraftVersion,
): object {
  switch (version) {
    case MinecraftVersion.V114:
    case MinecraftVersion.V115:
    case MinecraftVersion.V116:
    case MinecraftVersion.V117:
    case MinecraftVersion.V118:
    case MinecraftVersion.V119:
    case MinecraftVersion.V120:
      return {
        type: "minecraft:stonecutting",
        group: state.group.length > 0 ? state.group : undefined,
        ingredient: state.slots["stonecutter.ingredient"]
          ? get113ItemOutputFormat(state.slots["stonecutter.ingredient"], false)
          : {},
        result: state.slots["stonecutter.result"]?.id.raw ?? "",
        count: state.slots["stonecutter.result"]?.count ?? 1,
      } satisfies StonecuttingRecipe114Format;
    case MinecraftVersion.V121:
      return {
        type: "minecraft:stonecutting",
        group: state.group.length > 0 ? state.group : undefined,
        ingredient: state.slots["stonecutter.ingredient"]
          ? get113ItemOutputFormat(state.slots["stonecutter.ingredient"], false)
          : {},
        result: state.slots["stonecutter.result"]
          ? get121ItemOutputFormat(state.slots["stonecutter.result"], false)
          : {},
      } satisfies StonecuttingRecipe121Format;
    default:
      return {};
  }
}
