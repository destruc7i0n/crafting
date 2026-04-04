import {
  bedrockIdentifierHint,
  isValidBedrockNamespacedIdentifier,
} from "@/lib/minecraft-identifier";
import { Recipe, SlotContext, createEmptySlotContext } from "@/stores/recipe";

import { MinecraftVersion, RecipeType, SLOTS } from "../types";
import { buildBedrock as buildBedrockCooking, buildJava as buildJavaCooking } from "./cooking";
import {
  buildBedrock as buildBedrockCrafting,
  buildJava as buildJavaCrafting,
  extractCraftingInput,
} from "./crafting";
import { createRecipeFormatter } from "./format/recipe-formatter";
import { RecipeFormatter } from "./format/types";
import {
  BedrockBody,
  BedrockFormatVersion,
  BedrockRecipeMeta,
  CookingInput,
  GeneratedRecipe,
  JavaRecipe,
  SmithingInput,
  StonecutterInput,
  TransmuteInput,
} from "./recipes/types";
import { buildBedrock as buildBedrockSmithing, buildJava as buildJavaSmithing } from "./smithing";
import {
  buildBedrock as buildBedrockStonecutter,
  buildJava as buildJavaStonecutter,
} from "./stonecutter";
import { buildJava as buildJavaTransmute } from "./transmute";
import { wrapBedrockRecipe } from "./wrapper/bedrock";

export interface GenerateOptions {
  bedrockIdentifier?: string;
}

const extractCookingInput = (state: Recipe): CookingInput => ({
  recipeType: state.recipeType as CookingInput["recipeType"],
  ingredient: state.slots[SLOTS.cooking.ingredient],
  result: state.slots[SLOTS.cooking.result],
  time: state.cooking.time,
  experience: state.cooking.experience,
  group: state.group,
  category: state.category || undefined,
});

const extractStonecutterInput = (state: Recipe): StonecutterInput => ({
  ingredient: state.slots[SLOTS.stonecutter.ingredient],
  result: state.slots[SLOTS.stonecutter.result],
  group: state.group,
});

const extractSmithingInput = (state: Recipe): SmithingInput => ({
  recipeType: state.recipeType as SmithingInput["recipeType"],
  template: state.slots[SLOTS.smithing.template],
  base: state.slots[SLOTS.smithing.base],
  addition: state.slots[SLOTS.smithing.addition],
  result: state.slots[SLOTS.smithing.result],
  trimPattern: state.smithingTrimPattern || undefined,
});

const extractTransmuteInput = (state: Recipe): TransmuteInput => ({
  input: state.slots[SLOTS.crafting.slot1],
  material: state.slots[SLOTS.crafting.slot2],
  result: state.slots[SLOTS.crafting.result],
  group: state.group,
  category: state.category || undefined,
});

const BEDROCK_FORMAT_VERSION: BedrockFormatVersion = "1.20.10";

const BEDROCK_RECIPE_META: Partial<Record<RecipeType, BedrockRecipeMeta>> = {
  [RecipeType.Smelting]: {
    wrapperKey: "minecraft:recipe_furnace",
    tags: ["furnace"],
    formatVersion: BEDROCK_FORMAT_VERSION,
  },
  [RecipeType.Blasting]: {
    wrapperKey: "minecraft:recipe_furnace",
    tags: ["blast_furnace"],
    formatVersion: BEDROCK_FORMAT_VERSION,
  },
  [RecipeType.CampfireCooking]: {
    wrapperKey: "minecraft:recipe_furnace",
    tags: ["campfire", "soul_campfire"],
    formatVersion: BEDROCK_FORMAT_VERSION,
  },
  [RecipeType.Smoking]: {
    wrapperKey: "minecraft:recipe_furnace",
    tags: ["smoker"],
    formatVersion: BEDROCK_FORMAT_VERSION,
  },
  [RecipeType.Stonecutter]: {
    wrapperKey: "minecraft:recipe_shapeless",
    tags: ["stonecutter"],
    formatVersion: BEDROCK_FORMAT_VERSION,
  },
  [RecipeType.SmithingTrim]: {
    wrapperKey: "minecraft:recipe_smithing_trim",
    tags: ["smithing_table"],
    formatVersion: BEDROCK_FORMAT_VERSION,
  },
  [RecipeType.SmithingTransform]: {
    wrapperKey: "minecraft:recipe_smithing_transform",
    tags: ["smithing_table"],
    formatVersion: BEDROCK_FORMAT_VERSION,
  },
  [RecipeType.Smithing]: {
    wrapperKey: "minecraft:recipe_shapeless",
    tags: ["smithing_table"],
    formatVersion: BEDROCK_FORMAT_VERSION,
  },
};

const getBedrockRecipeMeta = (state: Recipe): BedrockRecipeMeta => {
  if (state.recipeType === RecipeType.Crafting) {
    return {
      wrapperKey: state.crafting.shapeless
        ? "minecraft:recipe_shapeless"
        : "minecraft:recipe_shaped",
      tags: ["crafting_table"],
      formatVersion: BEDROCK_FORMAT_VERSION,
    };
  }

  const meta = BEDROCK_RECIPE_META[state.recipeType];
  if (!meta) throw new Error(`No Bedrock recipe meta for type: ${state.recipeType}`);
  return meta;
};

const generateJavaInner = ({
  state,
  version,
  formatter,
  slotContext,
}: {
  state: Recipe;
  version: MinecraftVersion;
  formatter: RecipeFormatter;
  slotContext: SlotContext;
}): JavaRecipe => {
  switch (state.recipeType) {
    case RecipeType.Crafting:
      return buildJavaCrafting({
        state: extractCraftingInput(state),
        formatter,
        version,
        slotContext,
      });
    case RecipeType.CraftingTransmute:
      return buildJavaTransmute({
        state: extractTransmuteInput(state),
        formatter,
        version,
        slotContext,
      });
    case RecipeType.Smelting:
    case RecipeType.Blasting:
    case RecipeType.Smoking:
    case RecipeType.CampfireCooking:
      return buildJavaCooking({
        state: extractCookingInput(state),
        formatter,
        version,
        slotContext,
      });
    case RecipeType.Smithing:
    case RecipeType.SmithingTransform:
    case RecipeType.SmithingTrim:
      return buildJavaSmithing({
        state: extractSmithingInput(state),
        formatter,
        version,
        slotContext,
      });
    case RecipeType.Stonecutter:
      return buildJavaStonecutter({
        state: extractStonecutterInput(state),
        formatter,
        version,
        slotContext,
      });
    default:
      throw new Error(`Unsupported Java recipe type: ${state.recipeType as string}`);
  }
};

const generateBedrockInner = (
  state: Recipe,
  formatter: RecipeFormatter,
  slotContext: SlotContext,
): BedrockBody => {
  switch (state.recipeType) {
    case RecipeType.Crafting:
      return buildBedrockCrafting(extractCraftingInput(state), formatter, slotContext);
    case RecipeType.Smelting:
    case RecipeType.Blasting:
    case RecipeType.Smoking:
    case RecipeType.CampfireCooking:
      return buildBedrockCooking(extractCookingInput(state), slotContext);
    case RecipeType.Smithing:
    case RecipeType.SmithingTransform:
    case RecipeType.SmithingTrim:
      return buildBedrockSmithing(extractSmithingInput(state), formatter, slotContext);
    case RecipeType.Stonecutter:
      return buildBedrockStonecutter(extractStonecutterInput(state), formatter, slotContext);
    default:
      throw new Error(`Unsupported Bedrock recipe type: ${state.recipeType}`);
  }
};

export function generate({
  state,
  version,
  slotContext = createEmptySlotContext(version),
  options,
}: {
  state: Recipe;
  version: MinecraftVersion;
  slotContext?: SlotContext;
  options?: GenerateOptions;
}): GeneratedRecipe {
  const formatter = createRecipeFormatter(version);

  if (version === MinecraftVersion.Bedrock) {
    const identifier = options?.bedrockIdentifier?.trim();

    if (!identifier) {
      throw new Error("Bedrock recipes must have an identifier");
    }

    if (!isValidBedrockNamespacedIdentifier(identifier)) {
      throw new Error(
        `Bedrock recipes must use a valid identifier (namespace:name; ${bedrockIdentifierHint})`,
      );
    }

    const inner = generateBedrockInner(state, formatter, slotContext);
    const meta = getBedrockRecipeMeta(state);

    return wrapBedrockRecipe({
      inner,
      wrapperKey: meta.wrapperKey,
      tags: meta.tags,
      options: {
        identifier,
        priority: state.bedrock.priority,
        formatVersion: meta.formatVersion,
      },
    });
  }

  return generateJavaInner({ state, version, formatter, slotContext });
}
