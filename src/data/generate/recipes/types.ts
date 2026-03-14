import { Item as ItemModel } from "@/data/models/types";
import { MinecraftVersion, RecipeType } from "@/data/types";

export type EmptyObject = Record<string, never>;

export type V112Ingredient = { item: string; data: number | undefined };
export type V113Ingredient = { item: string };
export type V1212Ingredient = string;
export type BedrockItemIngredient = { item: string; data?: number };
export type BedrockTagIngredient = { tag: string };
export type BedrockIngredient = BedrockItemIngredient | BedrockTagIngredient;

export type IngredientRef = V112Ingredient | V113Ingredient | V1212Ingredient | BedrockIngredient;

export type V112Result = { item: string; data?: number; count?: number };
export type V113Result = { item: string; count?: number };
export type V121Result = { id: string; count?: number };
export type BedrockResult = { item: string; data?: number; count?: number };

export type ObjectResultRef = V112Result | V113Result | V121Result | BedrockResult;

export interface ShapedCraftingRecipe {
  type: "crafting_shaped" | "minecraft:crafting_shaped";
  group?: string;
  pattern: string[];
  key: Record<string, IngredientRef>;
  result: ObjectResultRef | EmptyObject;
}

export interface ShapelessCraftingRecipe {
  type: "crafting_shapeless" | "minecraft:crafting_shapeless";
  group?: string;
  ingredients: IngredientRef[];
  result: ObjectResultRef | EmptyObject;
}

export interface CookingRecipe {
  type:
    | "smelting"
    | "minecraft:smelting"
    | "minecraft:blasting"
    | "minecraft:campfire_cooking"
    | "minecraft:smoking";
  group?: string;
  ingredient: IngredientRef | EmptyObject;
  result: ObjectResultRef | string | EmptyObject;
  experience?: number;
  cookingtime?: number;
}

export interface StonecuttingRecipe {
  type: "minecraft:stonecutting";
  group?: string;
  ingredient: IngredientRef | EmptyObject;
  result: ObjectResultRef | string | EmptyObject;
  count?: number;
}

export interface SmithingRecipe {
  type: "minecraft:smithing";
  base: IngredientRef | EmptyObject;
  addition: IngredientRef | EmptyObject;
  result: ObjectResultRef | EmptyObject;
}

export interface SmithingTrimRecipe {
  type: "minecraft:smithing_trim";
  template: IngredientRef | EmptyObject;
  base: IngredientRef | EmptyObject;
  addition: IngredientRef | EmptyObject;
}

export interface SmithingTransformRecipe {
  type: "minecraft:smithing_transform";
  template: IngredientRef | EmptyObject;
  base: IngredientRef | EmptyObject;
  addition: IngredientRef | EmptyObject;
  result: ObjectResultRef | EmptyObject;
}

export interface CraftingTransmuteRecipe {
  type: "minecraft:crafting_transmute";
  group?: string;
  input: IngredientRef | EmptyObject;
  material: IngredientRef | EmptyObject;
  result: ObjectResultRef | EmptyObject;
}

export type JavaRecipe =
  | ShapedCraftingRecipe
  | ShapelessCraftingRecipe
  | CookingRecipe
  | StonecuttingRecipe
  | SmithingRecipe
  | SmithingTrimRecipe
  | SmithingTransformRecipe
  | CraftingTransmuteRecipe;

export interface BedrockShapedBody {
  pattern: string[];
  key: Record<string, IngredientRef>;
  result: ObjectResultRef | EmptyObject;
}

export interface BedrockShapelessBody {
  ingredients: IngredientRef[];
  result: ObjectResultRef | EmptyObject;
}

export interface BedrockFurnaceBody {
  input: IngredientRef | EmptyObject;
  output: ObjectResultRef | EmptyObject;
}

export interface BedrockSmithingTrimBody {
  template: BedrockTagIngredient | EmptyObject;
  base: BedrockTagIngredient | EmptyObject;
  addition: BedrockTagIngredient | EmptyObject;
}

export interface BedrockSmithingTransformBody {
  template: string;
  base: string;
  addition: string;
  result: string;
}

export type BedrockBody =
  | BedrockShapedBody
  | BedrockShapelessBody
  | BedrockFurnaceBody
  | BedrockSmithingTrimBody
  | BedrockSmithingTransformBody;

export type BedrockFormatVersion = "1.12" | "1.17" | "1.20.10";

export type BedrockTag =
  | "crafting_table"
  | "furnace"
  | "blast_furnace"
  | "smoker"
  | "campfire"
  | "soul_campfire"
  | "stonecutter"
  | "smithing_table";

export type BedrockWrapperKey =
  | "minecraft:recipe_shaped"
  | "minecraft:recipe_shapeless"
  | "minecraft:recipe_furnace"
  | "minecraft:recipe_smithing_trim"
  | "minecraft:recipe_smithing_transform";

interface BedrockBaseWrapper {
  description: {
    identifier: string;
  };
  tags: BedrockTag[];
  priority?: number;
}

export interface BedrockShapedRecipe {
  format_version: BedrockFormatVersion;
  "minecraft:recipe_shaped": BedrockBaseWrapper & BedrockShapedBody;
}

export interface BedrockShapelessRecipe {
  format_version: BedrockFormatVersion;
  "minecraft:recipe_shapeless": BedrockBaseWrapper & BedrockShapelessBody;
}

export interface BedrockFurnaceRecipe {
  format_version: BedrockFormatVersion;
  "minecraft:recipe_furnace": BedrockBaseWrapper & BedrockFurnaceBody;
}

export interface BedrockSmithingTrimRecipe {
  format_version: BedrockFormatVersion;
  "minecraft:recipe_smithing_trim": BedrockBaseWrapper & BedrockSmithingTrimBody;
}

export interface BedrockSmithingTransformRecipe {
  format_version: BedrockFormatVersion;
  "minecraft:recipe_smithing_transform": BedrockBaseWrapper & BedrockSmithingTransformBody;
}

export type BedrockRecipe =
  | BedrockShapedRecipe
  | BedrockShapelessRecipe
  | BedrockFurnaceRecipe
  | BedrockSmithingTrimRecipe
  | BedrockSmithingTransformRecipe;

export type GeneratedRecipe = JavaRecipe | BedrockRecipe;

export interface CraftingInput {
  grid: (ItemModel | undefined)[];
  result: ItemModel | undefined;
  shapeless: boolean;
  keepWhitespace: boolean;
  group: string;
}

export interface CookingInput {
  recipeType:
    | RecipeType.Smelting
    | RecipeType.Blasting
    | RecipeType.CampfireCooking
    | RecipeType.Smoking;
  ingredient: ItemModel | undefined;
  result: ItemModel | undefined;
  time: number;
  experience: number;
  group: string;
}

export interface StonecutterInput {
  ingredient: ItemModel | undefined;
  result: ItemModel | undefined;
  group: string;
}

export interface TransmuteInput {
  input: ItemModel | undefined;
  material: ItemModel | undefined;
  result: ItemModel | undefined;
  group: string;
}

export interface SmithingInput {
  recipeType: RecipeType.Smithing | RecipeType.SmithingTrim | RecipeType.SmithingTransform;
  template: ItemModel | undefined;
  base: ItemModel | undefined;
  addition: ItemModel | undefined;
  result: ItemModel | undefined;
}

export interface BedrockRecipeMeta {
  wrapperKey: BedrockWrapperKey;
  tags: BedrockTag[];
  formatVersion: BedrockFormatVersion;
}

export const isBedrockVersion = (version: MinecraftVersion): version is MinecraftVersion.Bedrock =>
  version === MinecraftVersion.Bedrock;
