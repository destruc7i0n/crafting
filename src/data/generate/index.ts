import { SingleRecipeState } from "@/stores/recipe";

import { createFormatStrategy } from "./format/item-formatter";
import { wrapBedrockRecipe } from "./wrapper/bedrock";
import { buildBedrock as buildBedrockCooking, buildJava as buildJavaCooking } from "./cooking";
import { buildBedrock as buildBedrockCrafting, buildJava as buildJavaCrafting } from "./crafting";
import { buildBedrock as buildBedrockSmithing, buildJava as buildJavaSmithing } from "./smithing";
import { buildBedrock as buildBedrockStonecutter, buildJava as buildJavaStonecutter } from "./stonecutter";
import { buildJava as buildJavaTransmute } from "./transmute";
import { MinecraftVersion, RecipeType } from "../types";
import {
  BedrockBody,
  BedrockRecipeMeta,
  CookingInput,
  CraftingInput,
  GeneratedRecipe,
  JavaRecipe,
  SmithingInput,
  StonecutterInput,
  TransmuteInput,
} from "./recipes/types";

const extractCraftingInput = (state: SingleRecipeState): CraftingInput => ({
  grid: [
    state.slots["crafting.1"],
    state.slots["crafting.2"],
    state.slots["crafting.3"],
    state.slots["crafting.4"],
    state.slots["crafting.5"],
    state.slots["crafting.6"],
    state.slots["crafting.7"],
    state.slots["crafting.8"],
    state.slots["crafting.9"],
  ],
  result: state.slots["crafting.result"],
  shapeless: state.crafting.shapeless,
  keepWhitespace: state.crafting.keepWhitespace,
  group: state.group,
});

const extractCookingInput = (state: SingleRecipeState): CookingInput => ({
  recipeType: state.recipeType as CookingInput["recipeType"],
  ingredient: state.slots["cooking.ingredient"],
  result: state.slots["cooking.result"],
  time: state.cooking.time,
  experience: state.cooking.experience,
  group: state.group,
});

const extractStonecutterInput = (state: SingleRecipeState): StonecutterInput => ({
  ingredient: state.slots["stonecutter.ingredient"],
  result: state.slots["stonecutter.result"],
  group: state.group,
});

const extractSmithingInput = (state: SingleRecipeState): SmithingInput => ({
  recipeType: state.recipeType as SmithingInput["recipeType"],
  template: state.slots["smithing.template"],
  base: state.slots["smithing.base"],
  addition: state.slots["smithing.addition"],
  result: state.slots["smithing.result"],
});

const extractTransmuteInput = (state: SingleRecipeState): TransmuteInput => ({
  input: state.slots["crafting.1"],
  material: state.slots["crafting.2"],
  result: state.slots["crafting.result"],
  group: state.group,
});

const getBedrockRecipeMeta = (state: SingleRecipeState): BedrockRecipeMeta => {
  switch (state.recipeType) {
    case RecipeType.Crafting:
      return {
        wrapperKey: state.crafting.shapeless
          ? "minecraft:recipe_shapeless"
          : "minecraft:recipe_shaped",
        tags: ["crafting_table"],
        formatVersion: "1.12",
      };
    case RecipeType.Smelting:
      return {
        wrapperKey: "minecraft:recipe_furnace",
        tags: ["furnace"],
        formatVersion: "1.12",
      };
    case RecipeType.Blasting:
      return {
        wrapperKey: "minecraft:recipe_furnace",
        tags: ["blast_furnace"],
        formatVersion: "1.12",
      };
    case RecipeType.CampfireCooking:
      return {
        wrapperKey: "minecraft:recipe_furnace",
        tags: ["campfire", "soul_campfire"],
        formatVersion: "1.12",
      };
    case RecipeType.Smoking:
      return {
        wrapperKey: "minecraft:recipe_furnace",
        tags: ["smoker"],
        formatVersion: "1.12",
      };
    case RecipeType.Stonecutter:
      return {
        wrapperKey: "minecraft:recipe_shapeless",
        tags: ["stonecutter"],
        formatVersion: "1.12",
      };
    case RecipeType.SmithingTrim:
      return {
        wrapperKey: "minecraft:recipe_smithing_trim",
        tags: ["smithing_table"],
        formatVersion: "1.17",
      };
    case RecipeType.SmithingTransform:
      return {
        wrapperKey: "minecraft:recipe_smithing_transform",
        tags: ["smithing_table"],
        formatVersion: "1.17",
      };
    case RecipeType.Smithing:
      return {
        wrapperKey: "minecraft:recipe_shapeless",
        tags: ["smithing_table"],
        formatVersion: "1.12",
      };
    case RecipeType.CraftingTransmute:
      return {
        wrapperKey: "minecraft:recipe_shapeless",
        tags: ["crafting_table"],
        formatVersion: "1.12",
      };
  }
};

const generateJavaInner = (
  state: SingleRecipeState,
  formatter: ReturnType<typeof createFormatStrategy>,
): JavaRecipe => {
  switch (state.recipeType) {
    case RecipeType.Crafting:
      return buildJavaCrafting(extractCraftingInput(state), formatter);
    case RecipeType.CraftingTransmute:
      return buildJavaTransmute(extractTransmuteInput(state), formatter);
    case RecipeType.Smelting:
    case RecipeType.Blasting:
    case RecipeType.Smoking:
    case RecipeType.CampfireCooking:
      return buildJavaCooking(extractCookingInput(state), formatter);
    case RecipeType.Smithing:
    case RecipeType.SmithingTransform:
    case RecipeType.SmithingTrim:
      return buildJavaSmithing(extractSmithingInput(state), formatter);
    case RecipeType.Stonecutter:
      return buildJavaStonecutter(extractStonecutterInput(state), formatter);
    default:
      throw new Error(`Unsupported Java recipe type: ${state.recipeType}`);
  }
};

const generateBedrockInner = (
  state: SingleRecipeState,
  formatter: ReturnType<typeof createFormatStrategy>,
): BedrockBody => {
  switch (state.recipeType) {
    case RecipeType.Crafting:
      return buildBedrockCrafting(extractCraftingInput(state), formatter);
    case RecipeType.Smelting:
    case RecipeType.Blasting:
    case RecipeType.Smoking:
    case RecipeType.CampfireCooking:
      return buildBedrockCooking(extractCookingInput(state), formatter);
    case RecipeType.Smithing:
    case RecipeType.SmithingTransform:
    case RecipeType.SmithingTrim:
      return buildBedrockSmithing(extractSmithingInput(state), formatter);
    case RecipeType.Stonecutter:
      return buildBedrockStonecutter(extractStonecutterInput(state), formatter);
    default:
      throw new Error(`Unsupported Bedrock recipe type: ${state.recipeType}`);
  }
};

export function generate(
  state: SingleRecipeState,
  version: MinecraftVersion,
): GeneratedRecipe {
  const formatter = createFormatStrategy(version);

  if (version === MinecraftVersion.Bedrock) {
    const inner = generateBedrockInner(state, formatter);
    const meta = getBedrockRecipeMeta(state);

    return wrapBedrockRecipe(inner, meta.wrapperKey, meta.tags, {
      identifier: state.bedrock?.identifier ?? "crafting:recipe",
      priority: state.bedrock?.priority ?? 0,
      formatVersion: meta.formatVersion,
    });
  }

  return generateJavaInner(state, formatter);
}
