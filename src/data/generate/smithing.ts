import { SingleRecipeState } from "@/stores/recipe";

import { createFormatStrategy } from "./format/item-formatter";
import { FormatStrategy } from "./format/types";
import { formatIngredient, formatIngredientString } from "./ingredient";
import { isVersionAtLeast } from "./version-utils";
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
  version: MinecraftVersion,
): SmithingRecipe | SmithingTrimRecipe | SmithingTransformRecipe => {
  if (state.recipeType === RecipeType.Smithing) {
    return {
      type: formatter.recipeType("smithing") as "minecraft:smithing",
      result: state.result ? formatter.objectResult(state.result.id) : {},
      base: formatIngredient(state.base, formatter),
      addition: formatIngredient(state.addition, formatter),
    } satisfies SmithingRecipe;
  }

  if (state.recipeType === RecipeType.SmithingTrim) {
    return {
      type: formatter.recipeType("smithing_trim") as "minecraft:smithing_trim",
      template: formatIngredient(state.template, formatter),
      base: formatIngredient(state.base, formatter),
      addition: formatIngredient(state.addition, formatter),
      ...(isVersionAtLeast(version, MinecraftVersion.V1215) && state.trimPattern
        ? { pattern: state.trimPattern }
        : {}),
    } satisfies SmithingTrimRecipe;
  }

  return {
    type: formatter.recipeType("smithing_transform") as "minecraft:smithing_transform",
    template: formatIngredient(state.template, formatter),
    base: formatIngredient(state.base, formatter),
    addition: formatIngredient(state.addition, formatter),
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
      template: formatIngredientString(state.template),
      base: formatIngredientString(state.base),
      addition: formatIngredientString(state.addition),
      result: state.result?.id.raw ?? "",
    } satisfies BedrockSmithingTransformBody;
  }

  return {
    ingredients: [state.base, state.addition]
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((item) => formatIngredient(item, formatter)),
    result: state.result ? formatter.objectResult(state.result.id, state.result.count) : {},
  } satisfies BedrockShapelessBody;
};

const extractInput = (state: SingleRecipeState): SmithingInput => ({
  recipeType: state.recipeType as SmithingInput["recipeType"],
  template: state.slots["smithing.template"],
  base: state.slots["smithing.base"],
  addition: state.slots["smithing.addition"],
  result: state.slots["smithing.result"],
  trimPattern: state.smithingTrimPattern,
});

export const validateSmithing = (
  state: SingleRecipeState,
  version?: MinecraftVersion,
): string[] => {
  const input = extractInput(state);
  const errors: string[] = [];

  if (
    input.recipeType === RecipeType.SmithingTrim ||
    input.recipeType === RecipeType.SmithingTransform
  ) {
    if (!input.template) {
      errors.push("Add a template item");
    }
  }

  if (!input.base) {
    errors.push("Add a base item");
  }

  if (!input.addition) {
    errors.push("Add an addition item");
  }

  if (input.recipeType !== RecipeType.SmithingTrim && !input.result) {
    errors.push("Add a result item");
  }

  if (
    version &&
    isVersionAtLeast(version, MinecraftVersion.V1215) &&
    input.recipeType === RecipeType.SmithingTrim &&
    !input.trimPattern
  ) {
    errors.push("Add a trim pattern");
  }

  return errors;
};

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

  return buildJava(input, formatter, version);
};
