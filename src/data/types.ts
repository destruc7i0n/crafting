export interface Item {
  item: string;
  count?: number;
}

export interface ItemWithData extends Item {
  data?: number;
}

export interface ItemWithComponents extends Item {
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
  key: Record<string, { item: ItemWithData }>;
  result: OrEmpty<ItemWithData>;
}

export interface Shapeless112RecipeFormat {
  type: string;
  group?: string;
  ingredients: ItemWithData[];
  result: OrEmpty<ItemWithData>;
}

export interface Shaped114RecipeFormat {
  type: string;
  group?: string;
  pattern: string[];
  key: Record<string, { item: Item }>;
  result: OrEmpty<Item>;
}

export interface Shapeless114RecipeFormat {
  type: string;
  group?: string;
  ingredients: Item[];
  result: OrEmpty<Item>;
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
  ingredient: OrEmpty<ItemWithData>;
  result: string;
}

export interface CookingRecipe114Format {
  type: string;
  group?: string;
  experience?: number;
  cookingtime?: number;
  ingredient: OrEmpty<Item>;
  result: string;
}

export type CookingRecipe = CookingRecipe113Format | CookingRecipe114Format;

//// STONECUTTING RECIPE FORMATS ////

export interface StonecuttingRecipe114Format {
  type: string;
  group?: string;
  ingredient: OrEmpty<Item>;
  result: string;
  count: number;
}

//// SMITHING RECIPE FORMATS ////

export interface SmithingRecipe116Format {
  type: string;
  base: OrEmpty<Item>;
  addition: OrEmpty<Item>;
  result: OrEmpty<Item>;
}

export interface SmithingRecipeTrim119Format {
  type: string;
  template: OrEmpty<Item>;
  base: OrEmpty<Item>;
  addition: OrEmpty<Item>;
}

export interface SmithingRecipeTransform119Format {
  type: string;
  template: OrEmpty<Item>;
  base: OrEmpty<Item>;
  addition: OrEmpty<Item>;
  result: OrEmpty<Item>;
}

export type SmithingRecipe =
  | SmithingRecipe116Format
  | SmithingRecipeTrim119Format
  | SmithingRecipeTransform119Format;
