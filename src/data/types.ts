// Output item types

export interface OutputItem112 {
  item: string;
  count?: number;
}

export interface OutputItem112WithData extends OutputItem112 {
  data: number | undefined;
}

export interface OutputItem121 {
  id: string;
  count?: number;
}

export interface ItemWithComponents extends OutputItem121 {
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

  Stonecutter = "stonecutter",

  Smithing = "smithing",
  SmithingTrim = "smithing_trim",
  SmithingTransform = "smithing_transform",
}

// Store Types

type CraftingSlots =
  | "crafting.1"
  | "crafting.2"
  | "crafting.3"
  | "crafting.4"
  | "crafting.5"
  | "crafting.6"
  | "crafting.7"
  | "crafting.8"
  | "crafting.9"
  | "crafting.result";
type CookingSlots = "cooking.ingredient" | "cooking.result";
type SmithingSlots =
  | "smithing.template"
  | "smithing.base"
  | "smithing.addition"
  | "smithing.result";
type StonecutterSlots = "stonecutter.ingredient" | "stonecutter.result";

export type RecipeSlot =
  | CraftingSlots
  | CookingSlots
  | SmithingSlots
  | StonecutterSlots;

//// CRAFTING RECIPE FORMATS ////

type OrEmpty<T> = T | Record<string, never>;

export interface Shaped112RecipeFormat {
  type: string;
  group?: string;
  pattern: string[];
  key: Record<string, OutputItem112WithData>;
  result: OrEmpty<OutputItem112WithData>;
}

export interface Shapeless112RecipeFormat {
  type: string;
  group?: string;
  ingredients: OutputItem112WithData[];
  result: OrEmpty<OutputItem112WithData>;
}

export interface Shaped114RecipeFormat {
  type: string;
  group?: string;
  pattern: string[];
  key: Record<string, OutputItem112>;
  result: OrEmpty<OutputItem112>;
}

export interface Shapeless114RecipeFormat {
  type: string;
  group?: string;
  ingredients: OutputItem112[];
  result: OrEmpty<OutputItem112>;
}

export interface Shaped121RecipeFormat {
  type: string;
  group?: string;
  pattern: string[];
  key: Record<string, OutputItem112>;
  result: OrEmpty<OutputItem121>;
}

export interface Shapeless121RecipeFormat {
  type: string;
  group?: string;
  ingredients: OutputItem112[];
  result: OrEmpty<OutputItem121>;
}

//// COOKING RECIPE FORMATS ////

export interface CookingRecipe113Format {
  type: string;
  group?: string;
  experience?: number;
  cookingtime?: number;
  ingredient: OrEmpty<OutputItem112WithData>;
  result: string;
}

export interface CookingRecipe114Format {
  type: string;
  group?: string;
  experience?: number;
  cookingtime?: number;
  ingredient: OrEmpty<OutputItem112>;
  result: string;
}

export interface CookingRecipe121Format {
  type: string;
  group?: string;
  experience?: number;
  cookingtime?: number;
  ingredient: OrEmpty<OutputItem112>;
  result: OrEmpty<OutputItem121>;
}

//// STONECUTTING RECIPE FORMATS ////

export interface StonecuttingRecipe114Format {
  type: string;
  group?: string;
  ingredient: OrEmpty<OutputItem112>;
  result: string;
  count: number;
}

export interface StonecuttingRecipe121Format {
  type: string;
  group?: string;
  ingredient: OrEmpty<OutputItem112>;
  result: OrEmpty<OutputItem121>;
}

//// SMITHING RECIPE FORMATS ////

export interface SmithingRecipe116Format {
  type: string;
  base: OrEmpty<OutputItem112>;
  addition: OrEmpty<OutputItem112>;
  result: OrEmpty<OutputItem112>;
}

export interface SmithingRecipeTrim119Format {
  type: string;
  template: OrEmpty<OutputItem112>;
  base: OrEmpty<OutputItem112>;
  addition: OrEmpty<OutputItem112>;
}

export interface SmithingRecipeTrim121Format {
  type: string;
  template: OrEmpty<OutputItem112>;
  base: OrEmpty<OutputItem112>;
  addition: OrEmpty<OutputItem121>;
}

export interface SmithingRecipeTransform119Format {
  type: string;
  template: OrEmpty<OutputItem112>;
  base: OrEmpty<OutputItem112>;
  addition: OrEmpty<OutputItem112>;
  result: OrEmpty<OutputItem112>;
}

export interface SmithingRecipeTransform121Format {
  type: string;
  template: OrEmpty<OutputItem112>;
  base: OrEmpty<OutputItem112>;
  addition: OrEmpty<OutputItem112>;
  result: OrEmpty<OutputItem121>;
}

// Output Tag

export interface OutputTag {
  values: string[];
}
