import { SingleRecipeState } from "@/stores/recipe";

import { createFormatStrategy } from "./format/item-formatter";
import { FormatStrategy } from "./format/types";
import { MinecraftVersion, RecipeType } from "../types";
import {
  BedrockFurnaceBody,
  CookingInput,
  CookingRecipe,
} from "./recipes/types";

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
): CookingRecipe => {
  const group = state.group.length > 0 ? state.group : undefined;

  const input = state.ingredient;
  const output = state.result;

  const baseType = recipeTypeToBaseCookingType[
    state.recipeType as keyof typeof recipeTypeToBaseCookingType
  ];

  if (!baseType) {
    throw new Error(`Unsupported cooking recipe type: ${state.recipeType}`);
  }

  const constantFields: Pick<CookingRecipe, "group" | "experience" | "cookingtime"> = {
    group,
    experience: state.experience > 0 ? state.experience : undefined,
    cookingtime: state.time > 0 ? state.time : undefined,
  };

  return {
    type: formatter.recipeType(baseType) as CookingRecipe["type"],
    ...constantFields,
    ingredient: input ? formatter.ingredient(input.id) : {},
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
    input: input ? formatter.ingredient(input.id) : {},
    output: output ? formatter.objectResult(output.id, output.count) : {},
  } satisfies BedrockFurnaceBody;
};

const extractInput = (state: SingleRecipeState): CookingInput => ({
  recipeType: state.recipeType as CookingInput["recipeType"],
  ingredient: state.slots["cooking.ingredient"],
  result: state.slots["cooking.result"],
  time: state.cooking.time,
  experience: state.cooking.experience,
  group: state.group,
});

export const generate = (
  state: SingleRecipeState,
  version: MinecraftVersion,
): CookingRecipe | BedrockFurnaceBody => {
  const input = extractInput(state);
  const formatter = createFormatStrategy(version);

  if (version === MinecraftVersion.Bedrock) {
    return buildBedrock(input, formatter);
  }

  return buildJava(input, formatter);
};
