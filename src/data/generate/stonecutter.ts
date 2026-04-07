import { createEmptySlotContext } from "@/stores/recipe/slot-value";
import { getRequiredSlotIdentifier, getSlotCount } from "@/stores/recipe/slot-value";
import { Recipe, SlotContext } from "@/stores/recipe/types";

import { MinecraftVersion, SLOTS } from "../types";
import { createRecipeFormatter } from "./format/recipe-formatter";
import { RecipeFormatter } from "./format/types";
import { formatIngredient } from "./ingredient";
import { BedrockShapelessBody, StonecutterInput, StonecuttingRecipe } from "./recipes/types";
import { isVersionAtLeast } from "./version-utils";

export const buildJava = ({
  state,
  formatter,
  version,
  slotContext,
}: {
  state: StonecutterInput;
  formatter: RecipeFormatter;
  version: MinecraftVersion;
  slotContext: SlotContext;
}): StonecuttingRecipe => {
  const result = state.result
    ? formatter.stonecutterResult(
        getRequiredSlotIdentifier(state.result, slotContext),
        getSlotCount(state.result),
      )
    : { result: {} };

  // group was removed from stonecutting in 26.1 (no recipe book)
  const group =
    !isVersionAtLeast(version, MinecraftVersion.V261) && state.group.length > 0
      ? state.group
      : undefined;

  return {
    type: formatter.recipeType("stonecutting") as "minecraft:stonecutting",
    ...(group ? { group } : {}),
    ingredient: formatIngredient({ item: state.ingredient, formatter, slotContext }),
    ...result,
  } satisfies StonecuttingRecipe;
};

export const buildBedrock = (
  state: StonecutterInput,
  formatter: RecipeFormatter,
  slotContext: SlotContext,
): BedrockShapelessBody => {
  const ingredients = state.ingredient
    ? [formatIngredient({ item: state.ingredient, formatter, slotContext })]
    : [];

  return {
    ingredients,
    result: state.result
      ? formatter.objectResult(
          getRequiredSlotIdentifier(state.result, slotContext),
          getSlotCount(state.result),
        )
      : {},
  } satisfies BedrockShapelessBody;
};

export const extractStonecutterInput = (state: Recipe): StonecutterInput => ({
  ingredient: state.slots[SLOTS.stonecutter.ingredient],
  result: state.slots[SLOTS.stonecutter.result],
  group: state.group,
});

export const validateStonecutter = (state: Recipe): string[] => {
  const input = extractStonecutterInput(state);
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
  state: Recipe,
  version: MinecraftVersion,
  slotContext = createEmptySlotContext(version),
): StonecuttingRecipe | BedrockShapelessBody => {
  const input = extractStonecutterInput(state);
  const formatter = createRecipeFormatter(version);

  if (version === MinecraftVersion.Bedrock) {
    return buildBedrock(input, formatter, slotContext);
  }

  return buildJava({ state: input, formatter, version, slotContext });
};
