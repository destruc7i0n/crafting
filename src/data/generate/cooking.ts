import { getFullId } from "@/data/models/identifier/utilities";
import { SingleRecipeState } from "@/stores/recipe";

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

export const buildJava = (
  state: CookingInput,
  formatter: RecipeFormatter,
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

export const buildBedrock = (state: CookingInput): BedrockFurnaceBody => {
  const input = state.ingredient;
  const output = state.result;

  return {
    input: input && input.type !== "tag_item" ? getFullId(input.id) : {},
    output: output && output.type !== "tag_item" ? getFullId(output.id) : {},
  } satisfies BedrockFurnaceBody;
};

const extractInput = (state: SingleRecipeState): CookingInput => ({
  recipeType: state.recipeType as CookingInput["recipeType"],
  ingredient: state.slots[SLOTS.cooking.ingredient],
  result: state.slots[SLOTS.cooking.result],
  time: state.cooking.time,
  experience: state.cooking.experience,
  group: state.group,
  category: state.category || undefined,
});

export const validateCooking = (state: SingleRecipeState, version?: MinecraftVersion): string[] => {
  const input = extractInput(state);
  const errors: string[] = [];

  if (!input.ingredient) {
    errors.push("Add an ingredient item");
  }

  if (!input.result) {
    errors.push("Add a result item");
  }

  if (version === MinecraftVersion.Bedrock) {
    if (input.ingredient?.type === "tag_item") {
      errors.push("Bedrock furnace recipes do not support tag ingredients");
    }

    if (input.result?.count !== undefined && input.result.count > 1) {
      errors.push("Bedrock furnace recipes do not support result counts");
    }
  }

  return errors;
};

export const generate = (
  state: SingleRecipeState,
  version: MinecraftVersion,
): CookingRecipe | BedrockFurnaceBody => {
  const input = extractInput(state);

  if (version === MinecraftVersion.Bedrock) {
    return buildBedrock(input);
  }

  const formatter = createRecipeFormatter(version);
  return buildJava(input, formatter, version);
};
