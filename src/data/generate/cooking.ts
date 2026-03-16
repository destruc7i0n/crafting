import { SingleRecipeState } from "@/stores/recipe";

import { MinecraftVersion, RecipeType, SLOTS } from "../types";
import { createFormatStrategy } from "./format/item-formatter";
import { FormatStrategy } from "./format/types";
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

export const buildJava = (
  state: CookingInput,
  formatter: FormatStrategy,
  version: MinecraftVersion,
): CookingRecipe => {
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
    ingredient: formatIngredient(input, formatter),
    result: output ? formatter.cookingResult(output.id, output.count) : {},
  } satisfies CookingRecipe;
};

export const buildBedrock = (
  state: CookingInput,
  formatter: FormatStrategy,
): BedrockFurnaceBody => {
  const input = state.ingredient;
  const output = state.result;

  return {
    input: formatIngredient(input, formatter),
    output: output ? formatter.objectResult(output.id, output.count) : {},
  } satisfies BedrockFurnaceBody;
};

const extractInput = (state: SingleRecipeState): CookingInput => ({
  recipeType: state.recipeType as CookingInput["recipeType"],
  ingredient: state.slots[SLOTS.cooking.ingredient],
  result: state.slots[SLOTS.cooking.result],
  time: state.cooking.time,
  experience: state.cooking.experience,
  group: state.group,
  category: state.category,
});

export const validateCooking = (state: SingleRecipeState): string[] => {
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
): CookingRecipe | BedrockFurnaceBody => {
  const input = extractInput(state);
  const formatter = createFormatStrategy(version);

  if (version === MinecraftVersion.Bedrock) {
    return buildBedrock(input, formatter);
  }

  return buildJava(input, formatter, version);
};
