import { getRawId } from "@/data/models/identifier/utilities";
import { SingleRecipeState } from "@/stores/recipe";

import { MinecraftVersion, RecipeType, SLOTS } from "../types";
import { createRecipeFormatter } from "./format/recipe-formatter";
import { RecipeFormatter } from "./format/types";
import { formatIngredient, formatIngredientString } from "./ingredient";
import {
  BedrockShapelessBody,
  BedrockSmithingTransformBody,
  BedrockSmithingTrimBody,
  SmithingInput,
  SmithingRecipe,
  SmithingTransformRecipe,
  SmithingTrimRecipe,
} from "./recipes/types";
import { isVersionAtLeast } from "./version-utils";

export const buildJava = (
  state: SmithingInput,
  formatter: RecipeFormatter,
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
  formatter: RecipeFormatter,
): BedrockSmithingTrimBody | BedrockSmithingTransformBody | BedrockShapelessBody => {
  if (state.recipeType === RecipeType.SmithingTrim) {
    return {
      template: formatIngredient(state.template, formatter),
      base: formatIngredient(state.base, formatter),
      addition: formatIngredient(state.addition, formatter),
    } satisfies BedrockSmithingTrimBody;
  }

  if (state.recipeType === RecipeType.SmithingTransform) {
    return {
      template: formatIngredientString(state.template),
      base: formatIngredientString(state.base),
      addition: formatIngredientString(state.addition),
      result: state.result ? getRawId(state.result.id) : "",
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
  template: state.slots[SLOTS.smithing.template],
  base: state.slots[SLOTS.smithing.base],
  addition: state.slots[SLOTS.smithing.addition],
  result: state.slots[SLOTS.smithing.result],
  trimPattern: state.smithingTrimPattern || undefined,
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
  const formatter = createRecipeFormatter(version);

  if (version === MinecraftVersion.Bedrock) {
    return buildBedrock(input, formatter);
  }

  return buildJava(input, formatter, version);
};
