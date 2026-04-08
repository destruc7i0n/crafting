import { MinecraftVersion, RecipeSlot, RecipeType } from "@/data/types";
import { RecipeFormatter } from "@/recipes/generate/format/types";
import { BedrockBody, BedrockRecipeMeta, JavaRecipe } from "@/recipes/generate/types";
import { Recipe, SlotContext } from "@/stores/recipe/types";

export type PreviewKind = "crafting" | "furnace" | "smithing" | "stonecutter";

export interface RecipeTypeAvailability {
  minVersion: MinecraftVersion;
  maxVersion?: MinecraftVersion;
  bedrock: boolean;
  enabled?: boolean;
}

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

export interface RecipeDefinition {
  type: RecipeType;
  family: "crafting" | "cooking" | "smithing" | "stonecutter";
  label: string;
  iconItemId: string;
  previewKind?: PreviewKind;
  availability: RecipeTypeAvailability;
  slots: {
    getAutoPlace(recipe: Recipe): RecipeSlot[];
    resultSlots: RecipeSlot[];
    canEditCount(slot: RecipeSlot): boolean;
    isDisabled(recipe: Recipe, slot: RecipeSlot): boolean;
  };
  naming: {
    resultSlot?: RecipeSlot;
    sidebarFallbackLabel: string;
    getAutoNames(recipe: Recipe, ctx: SlotContext): string[];
  };
  validate(recipe: Recipe, version: MinecraftVersion, ctx: SlotContext): string[];
  generateJava(args: GenerateArgs): JavaRecipe;
  generateBedrock?(args: BedrockGenerateArgs): BedrockBody;
  getBedrockMeta?(recipe: Recipe): BedrockRecipeMeta;
}
