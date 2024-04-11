// Output item types

export interface OutputItem {
  item: string;
  count?: number;
}

export interface OutputItemWithData extends OutputItem {
  data?: number;
}

export interface ItemWithComponents extends OutputItem {
  components: unknown[];
}

export enum MinecraftVersion {
  Bedrock = "bedrock",
  V112 = "1.12",
  V113 = "1.13",
  V114 = "1.14",
  V115 = "1.15",
  V116 = "1.16",
  V117 = "1.17",
  V118 = "1.18",
  V119 = "1.19",
  V120 = "1.20",
  V121 = "1.21",
}

export enum RecipeType {
  Crafting = "crafting",

  Smelting = "smelting",
  CampfireCooking = "campfire_cooking",
  Blasting = "blasting",
  Smoking = "smoking",

  StoneCutting = "stonecutting",

  Smithing = "smithing",
  SmithingTrim = "smithing_trim",
  SmithingTransform = "smithing_transform",
}

//// CRAFTING RECIPE FORMATS ////

type OrEmpty<T> = T | Record<string, never>;

export interface Shaped112RecipeFormat {
  type: string;
  group?: string;
  pattern: string[];
  key: Record<string, { item: OutputItemWithData }>;
  result: OrEmpty<OutputItemWithData>;
}

export interface Shapeless112RecipeFormat {
  type: string;
  group?: string;
  ingredients: OutputItemWithData[];
  result: OrEmpty<OutputItemWithData>;
}

export interface Shaped114RecipeFormat {
  type: string;
  group?: string;
  pattern: string[];
  key: Record<string, { item: OutputItem }>;
  result: OrEmpty<OutputItem>;
}

export interface Shapeless114RecipeFormat {
  type: string;
  group?: string;
  ingredients: OutputItem[];
  result: OrEmpty<OutputItem>;
}

export type ShapedRecipe = Shaped112RecipeFormat | Shaped114RecipeFormat;
export type ShapelessRecipe =
  | Shapeless112RecipeFormat
  | Shapeless114RecipeFormat;

//// COOKING RECIPE FORMATS ////

export interface CookingRecipe113Format {
  type: string;
  group?: string;
  experience?: number;
  cookingtime?: number;
  ingredient: OrEmpty<OutputItemWithData>;
  result: string;
}

export interface CookingRecipe114Format {
  type: string;
  group?: string;
  experience?: number;
  cookingtime?: number;
  ingredient: OrEmpty<OutputItem>;
  result: string;
}

export type CookingRecipe = CookingRecipe113Format | CookingRecipe114Format;

//// STONECUTTING RECIPE FORMATS ////

export interface StonecuttingRecipe114Format {
  type: string;
  group?: string;
  ingredient: OrEmpty<OutputItem>;
  result: string;
  count: number;
}

//// SMITHING RECIPE FORMATS ////

export interface SmithingRecipe116Format {
  type: string;
  base: OrEmpty<OutputItem>;
  addition: OrEmpty<OutputItem>;
  result: OrEmpty<OutputItem>;
}

export interface SmithingRecipeTrim119Format {
  type: string;
  template: OrEmpty<OutputItem>;
  base: OrEmpty<OutputItem>;
  addition: OrEmpty<OutputItem>;
}

export interface SmithingRecipeTransform119Format {
  type: string;
  template: OrEmpty<OutputItem>;
  base: OrEmpty<OutputItem>;
  addition: OrEmpty<OutputItem>;
  result: OrEmpty<OutputItem>;
}

export type SmithingRecipe =
  | SmithingRecipe116Format
  | SmithingRecipeTrim119Format
  | SmithingRecipeTransform119Format;
