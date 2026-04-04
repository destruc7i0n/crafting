import { getFullId } from "@/data/models/identifier/utilities";
import { Recipe, SlotContext, createEmptySlotContext } from "@/stores/recipe";
import {
  getRequiredSlotIdentifier,
  getSlotCount,
  isTagSlotValue,
} from "@/stores/recipe/slot-value";

import { MinecraftVersion, RecipeType, SLOTS } from "../types";
import { createRecipeFormatter } from "./format/recipe-formatter";
import { RecipeFormatter } from "./format/types";
import { formatIngredient } from "./ingredient";
import { BedrockFurnaceBody, CookingInput, CookingRecipe } from "./recipes/types";
import { isVersionAtLeast } from "./version-utils";

const recipeTypeToBaseCookingType: Record<
  RecipeType.Smelting | RecipeType.Blasting | RecipeType.CampfireCooking | RecipeType.Smoking,
  "smelting" | "blasting" | "campfire_cooking" | "smoking"
> = {
  [RecipeType.Smelting]: "smelting",
  [RecipeType.Blasting]: "blasting",
  [RecipeType.CampfireCooking]: "campfire_cooking",
  [RecipeType.Smoking]: "smoking",
};

export const buildJava = ({
  state,
  formatter,
  version,
  slotContext,
}: {
  state: CookingInput;
  formatter: RecipeFormatter;
  version: MinecraftVersion;
  slotContext: SlotContext;
}): CookingRecipe => {
  const group = state.group.length > 0 ? state.group : undefined;
  const category = isVersionAtLeast(version, MinecraftVersion.V119) ? state.category : undefined;

  const input = state.ingredient;
  const output = state.result;

  const baseType =
    recipeTypeToBaseCookingType[state.recipeType as keyof typeof recipeTypeToBaseCookingType];

  if (!baseType) {
    throw new Error(`Unsupported cooking recipe type: ${state.recipeType}`);
  }

  return {
    type: formatter.recipeType(baseType) as CookingRecipe["type"],
    category,
    ...(group ? { group } : {}),
    experience: state.experience,
    cookingtime: state.time,
    ingredient: formatIngredient({ item: input, formatter, slotContext }),
    result: output
      ? formatter.cookingResult(
          getRequiredSlotIdentifier(output, slotContext),
          getSlotCount(output),
        )
      : {},
  } satisfies CookingRecipe;
};

export const buildBedrock = (state: CookingInput, slotContext: SlotContext): BedrockFurnaceBody => {
  const input = state.ingredient;
  const output = state.result;

  return {
    input:
      input && !isTagSlotValue(input)
        ? getFullId(getRequiredSlotIdentifier(input, slotContext))
        : {},
    output:
      output && !isTagSlotValue(output)
        ? getFullId(getRequiredSlotIdentifier(output, slotContext))
        : {},
  } satisfies BedrockFurnaceBody;
};

const extractInput = (state: Recipe): CookingInput => ({
  recipeType: state.recipeType as CookingInput["recipeType"],
  ingredient: state.slots[SLOTS.cooking.ingredient],
  result: state.slots[SLOTS.cooking.result],
  time: state.cooking.time,
  experience: state.cooking.experience,
  group: state.group,
  category: state.category || undefined,
});

export const validateCooking = (state: Recipe, version?: MinecraftVersion): string[] => {
  const input = extractInput(state);
  const errors: string[] = [];

  if (!input.ingredient) {
    errors.push("Add an ingredient item");
  }

  if (!input.result) {
    errors.push("Add a result item");
  }

  if (version === MinecraftVersion.Bedrock) {
    if (isTagSlotValue(input.ingredient)) {
      errors.push("Bedrock furnace recipes do not support tag ingredients");
    }

    if ((getSlotCount(input.result) ?? 1) > 1) {
      errors.push("Bedrock furnace recipes do not support result counts");
    }
  }

  return errors;
};

export const generate = (
  state: Recipe,
  version: MinecraftVersion,
  slotContext = createEmptySlotContext(version),
): CookingRecipe | BedrockFurnaceBody => {
  const input = extractInput(state);

  if (version === MinecraftVersion.Bedrock) {
    return buildBedrock(input, slotContext);
  }

  const formatter = createRecipeFormatter(version);
  return buildJava({ state: input, formatter, version, slotContext });
};
