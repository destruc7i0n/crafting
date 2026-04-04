import { getRawId } from "@/data/models/identifier/utilities";
import { Recipe, RecipeSlotValue, SlotContext, createEmptySlotContext } from "@/stores/recipe";
import { getRequiredSlotIdentifier, getSlotCount } from "@/stores/recipe/slot-value";

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

export const buildJava = ({
  state,
  formatter,
  version,
  slotContext,
}: {
  state: SmithingInput;
  formatter: RecipeFormatter;
  version: MinecraftVersion;
  slotContext: SlotContext;
}): SmithingRecipe | SmithingTrimRecipe | SmithingTransformRecipe => {
  if (state.recipeType === RecipeType.Smithing) {
    return {
      type: formatter.recipeType("smithing") as "minecraft:smithing",
      result: state.result
        ? formatter.objectResult(getRequiredSlotIdentifier(state.result, slotContext))
        : {},
      base: formatIngredient({ item: state.base, formatter, slotContext }),
      addition: formatIngredient({ item: state.addition, formatter, slotContext }),
    } satisfies SmithingRecipe;
  }

  if (state.recipeType === RecipeType.SmithingTrim) {
    return {
      type: formatter.recipeType("smithing_trim") as "minecraft:smithing_trim",
      template: formatIngredient({ item: state.template, formatter, slotContext }),
      base: formatIngredient({ item: state.base, formatter, slotContext }),
      addition: formatIngredient({ item: state.addition, formatter, slotContext }),
      ...(isVersionAtLeast(version, MinecraftVersion.V1215) && state.trimPattern
        ? { pattern: state.trimPattern }
        : {}),
    } satisfies SmithingTrimRecipe;
  }

  return {
    type: formatter.recipeType("smithing_transform") as "minecraft:smithing_transform",
    template: formatIngredient({ item: state.template, formatter, slotContext }),
    base: formatIngredient({ item: state.base, formatter, slotContext }),
    addition: formatIngredient({ item: state.addition, formatter, slotContext }),
    result: state.result
      ? formatter.objectResult(getRequiredSlotIdentifier(state.result, slotContext))
      : {},
  } satisfies SmithingTransformRecipe;
};

export const buildBedrock = (
  state: SmithingInput,
  formatter: RecipeFormatter,
  slotContext: SlotContext,
): BedrockSmithingTrimBody | BedrockSmithingTransformBody | BedrockShapelessBody => {
  if (state.recipeType === RecipeType.SmithingTrim) {
    return {
      template: formatIngredient({ item: state.template, formatter, slotContext }),
      base: formatIngredient({ item: state.base, formatter, slotContext }),
      addition: formatIngredient({ item: state.addition, formatter, slotContext }),
    } satisfies BedrockSmithingTrimBody;
  }

  if (state.recipeType === RecipeType.SmithingTransform) {
    return {
      template: formatIngredientString(state.template, slotContext),
      base: formatIngredientString(state.base, slotContext),
      addition: formatIngredientString(state.addition, slotContext),
      result: state.result ? getRawId(getRequiredSlotIdentifier(state.result, slotContext)) : "",
    } satisfies BedrockSmithingTransformBody;
  }

  return {
    ingredients: [state.base, state.addition]
      .filter((item): item is RecipeSlotValue => Boolean(item))
      .map((item) => formatIngredient({ item, formatter, slotContext })),
    result: state.result
      ? formatter.objectResult(
          getRequiredSlotIdentifier(state.result, slotContext),
          getSlotCount(state.result),
        )
      : {},
  } satisfies BedrockShapelessBody;
};

const extractInput = (state: Recipe): SmithingInput => ({
  recipeType: state.recipeType as SmithingInput["recipeType"],
  template: state.slots[SLOTS.smithing.template],
  base: state.slots[SLOTS.smithing.base],
  addition: state.slots[SLOTS.smithing.addition],
  result: state.slots[SLOTS.smithing.result],
  trimPattern: state.smithingTrimPattern || undefined,
});

export const validateSmithing = (state: Recipe, version?: MinecraftVersion): string[] => {
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
  state: Recipe,
  version: MinecraftVersion,
  slotContext = createEmptySlotContext(version),
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
    return buildBedrock(input, formatter, slotContext);
  }

  return buildJava({ state: input, formatter, version, slotContext });
};
