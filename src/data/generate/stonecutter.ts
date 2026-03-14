import { SingleRecipeState } from "@/stores/recipe";

import { createFormatStrategy } from "./format/item-formatter";
import { FormatStrategy } from "./format/types";
import { MinecraftVersion } from "../types";
import { BedrockShapelessBody, StonecutterInput, StonecuttingRecipe } from "./recipes/types";

export const buildJava = (
  state: StonecutterInput,
  formatter: FormatStrategy,
): StonecuttingRecipe => {
  const result = state.result
    ? formatter.stonecutterResult(state.result.id, state.result.count)
    : { result: {} };

  return {
    type: formatter.recipeType("stonecutting") as "minecraft:stonecutting",
    group: state.group.length > 0 ? state.group : undefined,
    ingredient: state.ingredient ? formatter.ingredient(state.ingredient.id) : {},
    ...result,
  } satisfies StonecuttingRecipe;
};

export const buildBedrock = (
  state: StonecutterInput,
  formatter: FormatStrategy,
): BedrockShapelessBody => {
  return {
    ingredients: state.ingredient ? [formatter.ingredient(state.ingredient.id)] : [],
    result: state.result ? formatter.objectResult(state.result.id, state.result.count) : {},
  } satisfies BedrockShapelessBody;
};

const extractInput = (state: SingleRecipeState): StonecutterInput => ({
  ingredient: state.slots["stonecutter.ingredient"],
  result: state.slots["stonecutter.result"],
  group: state.group,
});

export const validateStonecutter = (state: SingleRecipeState): string[] => {
  const input = extractInput(state);
  const errors: string[] = [];

  if (!input.ingredient) {
    errors.push("Add an ingredient item");
  }

  if (!input.result) {
    errors.push("Add a result item");
  }

  return errors;
};

export const generate = (
  state: SingleRecipeState,
  version: MinecraftVersion,
): StonecuttingRecipe | BedrockShapelessBody => {
  const input = extractInput(state);
  const formatter = createFormatStrategy(version);

  if (version === MinecraftVersion.Bedrock) {
    return buildBedrock(input, formatter);
  }

  return buildJava(input, formatter);
};
