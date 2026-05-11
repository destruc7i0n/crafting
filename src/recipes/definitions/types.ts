import { MinecraftVersion, RecipeType } from "@/data/types";
import { RecipeFormatter } from "@/recipes/generate/format/types";
import { BedrockBody, BedrockRecipeMeta, JavaRecipe } from "@/recipes/generate/types";
import { RecipeSlot } from "@/recipes/slots";
import { Recipe, SlotContext } from "@/stores/recipe/types";

export type PreviewKind = "crafting" | "furnace" | "smithing" | "stonecutter" | "brewing";

export interface GenerateArgs {
  recipe: Recipe;
  version: MinecraftVersion;
  formatter: RecipeFormatter;
  slotContext: SlotContext;
}

export interface BedrockGenerateArgs {
  recipe: Recipe;
  formatter: RecipeFormatter;
  slotContext: SlotContext;
}

export interface RecipeDefinitionSlots {
  getAutoPlace(recipe: Recipe): RecipeSlot[];
  resultSlots: RecipeSlot[];
  canEditCount(slot: RecipeSlot): boolean;
  isDisabled(recipe: Recipe, slot: RecipeSlot): boolean;
}

export interface RecipeDefinitionNaming {
  resultSlot?: RecipeSlot;
  sidebarFallbackLabel: string;
  getAutoNames(recipe: Recipe, ctx: SlotContext): string[];
}

export interface BaseRecipeDefinition {
  type: RecipeType;
  family: "crafting" | "cooking" | "smithing" | "stonecutter" | "brewing";
  label: string;
  iconItemId: string;
  previewKind?: PreviewKind;
  availability: {
    minVersion: MinecraftVersion;
    maxVersion?: MinecraftVersion;
    enabled?: boolean;
  };
  slots: RecipeDefinitionSlots;
  naming: RecipeDefinitionNaming;
  validate(recipe: Recipe, version: MinecraftVersion, ctx: SlotContext): string[];
}

export interface JavaSupportedRecipeDefinition extends BaseRecipeDefinition {
  generateJava(args: GenerateArgs): JavaRecipe;
}

export interface JavaOnlyRecipeDefinition extends JavaSupportedRecipeDefinition {
  generateBedrock?: never;
  getBedrockMeta?: never;
}

export interface JavaBedrockRecipeDefinition extends JavaSupportedRecipeDefinition {
  generateBedrock(args: BedrockGenerateArgs): BedrockBody;
  getBedrockMeta(recipe: Recipe): BedrockRecipeMeta;
}

export interface BedrockOnlyRecipeDefinition extends BaseRecipeDefinition {
  generateJava?: never;
  generateBedrock(args: BedrockGenerateArgs): BedrockBody;
  getBedrockMeta(recipe: Recipe): BedrockRecipeMeta;
}

export type BedrockSupportedRecipeDefinition =
  | JavaBedrockRecipeDefinition
  | BedrockOnlyRecipeDefinition;

export type RecipeDefinition = JavaOnlyRecipeDefinition | BedrockSupportedRecipeDefinition;
