import { SingleRecipeState } from "@/stores/recipe";

import { createFormatStrategy } from "./format/item-formatter";
import { FormatStrategy } from "./format/types";
import { MinecraftVersion, RecipeType } from "../types";
import {
  BedrockShapelessBody,
  BedrockSmithingTransformBody,
  BedrockSmithingTrimBody,
  SmithingInput,
  SmithingRecipe,
  SmithingTransformRecipe,
  SmithingTrimRecipe,
} from "./recipes/types";

export const buildJava = (
  state: SmithingInput,
  formatter: FormatStrategy,
): SmithingRecipe | SmithingTrimRecipe | SmithingTransformRecipe => {
  if (state.recipeType === RecipeType.Smithing) {
    return {
      type: formatter.recipeType("smithing") as "minecraft:smithing",
      result: state.result ? formatter.objectResult(state.result.id) : {},
      base: state.base ? formatter.ingredient(state.base.id) : {},
      addition: state.addition ? formatter.ingredient(state.addition.id) : {},
    } satisfies SmithingRecipe;
  }

  if (state.recipeType === RecipeType.SmithingTrim) {
    return {
      type: formatter.recipeType("smithing_trim") as "minecraft:smithing_trim",
      template: state.template ? formatter.ingredient(state.template.id) : {},
      base: state.base ? formatter.ingredient(state.base.id) : {},
      addition: state.addition ? formatter.ingredient(state.addition.id) : {},
    } satisfies SmithingTrimRecipe;
  }

  return {
    type: formatter.recipeType("smithing_transform") as "minecraft:smithing_transform",
    template: state.template ? formatter.ingredient(state.template.id) : {},
    base: state.base ? formatter.ingredient(state.base.id) : {},
    addition: state.addition ? formatter.ingredient(state.addition.id) : {},
    result: state.result ? formatter.objectResult(state.result.id) : {},
  } satisfies SmithingTransformRecipe;
};

export const buildBedrock = (
  state: SmithingInput,
  formatter: FormatStrategy,
): BedrockSmithingTrimBody | BedrockSmithingTransformBody | BedrockShapelessBody => {
  if (state.recipeType === RecipeType.SmithingTrim) {
    return {
      template: state.template ? { tag: state.template.id.raw } : {},
      base: state.base ? { tag: state.base.id.raw } : {},
      addition: state.addition ? { tag: state.addition.id.raw } : {},
    } satisfies BedrockSmithingTrimBody;
  }

  if (state.recipeType === RecipeType.SmithingTransform) {
    return {
      template: state.template?.id.raw ?? "",
      base: state.base?.id.raw ?? "",
      addition: state.addition?.id.raw ?? "",
      result: state.result?.id.raw ?? "",
    } satisfies BedrockSmithingTransformBody;
  }

  return {
    ingredients: [state.base, state.addition]
      .filter(Boolean)
      .map((item) => formatter.ingredient(item!.id)),
    result: state.result ? formatter.objectResult(state.result.id, state.result.count) : {},
  } satisfies BedrockShapelessBody;
};

const extractInput = (state: SingleRecipeState): SmithingInput => ({
  recipeType: state.recipeType as SmithingInput["recipeType"],
  template: state.slots["smithing.template"],
  base: state.slots["smithing.base"],
  addition: state.slots["smithing.addition"],
  result: state.slots["smithing.result"],
});

export const generate = (
  state: SingleRecipeState,
  version: MinecraftVersion,
):
  | SmithingRecipe
  | SmithingTrimRecipe
  | SmithingTransformRecipe
  | BedrockSmithingTrimBody
  | BedrockSmithingTransformBody
  | BedrockShapelessBody => {
  const input = extractInput(state);
  const formatter = createFormatStrategy(version);

  if (version === MinecraftVersion.Bedrock) {
    return buildBedrock(input, formatter);
  }

  return buildJava(input, formatter);
};
