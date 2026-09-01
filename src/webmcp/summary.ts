import { MinecraftVersion, RecipeType } from "@/data/types";
import { getSlotContext } from "@/lib/slot-context";
import { getRecipeDefinition, getSupportedRecipeTypesForVersion } from "@/recipes/definitions";
import { getCurrentRecipeName, resolveRecipeNames, toJavaRecipeFileName } from "@/recipes/naming";
import { RecipeSlot } from "@/recipes/slots";
import { validateRecipe } from "@/recipes/validation";
import { useRecipeStore } from "@/stores/recipe";
import { getSlotCount, getSlotDisplay } from "@/stores/recipe/slot-value";
import { Recipe, RecipeSlotValue, SlotContext } from "@/stores/recipe/types";
import { useSettingsStore } from "@/stores/settings";
import {
  getMinecraftVersionLabel,
  getRecipeCategoryOptions,
  supportsRecipeCategory,
  supportsShowNotification,
  supportsSmithingTrimPattern,
} from "@/versioning";

import { formatIngredientRef } from "./ingredient-ref";
import { getSlotLayout, SlotLayoutEntry } from "./slot-rules";

export type SlotSummary = { ref: string; label: string; count?: number; missing?: boolean };

export type RecipeSummary = {
  id: string;
  title: string;
  recipeType: RecipeType;
  options: Record<string, unknown>;
  slots: Partial<Record<RecipeSlot, SlotSummary>>;
  slotLayout: SlotLayoutEntry[];
  valid: boolean;
  errors: string[];
  warnings: string[];
};

export type EditorSummary = {
  version: MinecraftVersion;
  versionLabel: string;
  bedrockNamespace: string;
  resourcesLoaded: boolean;
  supportedRecipeTypes: RecipeType[];
  categoryOptions?: string[];
  recipes: {
    id: string;
    title: string;
    recipeType: RecipeType;
    selected: boolean;
    valid: boolean;
  }[];
  selectedRecipe: RecipeSummary;
  exportName?: string;
};

const COOKING_RECIPE_TYPES = new Set<RecipeType>([
  RecipeType.Smelting,
  RecipeType.Blasting,
  RecipeType.CampfireCooking,
  RecipeType.Smoking,
]);

const buildRecipeOptions = (recipe: Recipe, version: MinecraftVersion): Record<string, unknown> => {
  const { recipeType } = recipe;
  const isBedrock = version === MinecraftVersion.Bedrock;
  const options: Record<string, unknown> = {
    nameMode: recipe.nameMode,
    name: recipe.name,
    group: recipe.group,
  };

  if (supportsRecipeCategory(version, recipeType)) {
    options.category = recipe.category;
  }

  if (supportsShowNotification(version, recipeType, recipe.crafting.shapeless)) {
    options.showNotification = recipe.showNotification;
  }

  if (recipeType === RecipeType.Crafting) {
    options.crafting = {
      shapeless: recipe.crafting.shapeless,
      keepWhitespace: recipe.crafting.keepWhitespace,
      ...(isBedrock ? {} : { twoByTwo: recipe.crafting.twoByTwo }),
    };
  }

  if (COOKING_RECIPE_TYPES.has(recipeType)) {
    options.cooking = { time: recipe.cooking.time, experience: recipe.cooking.experience };
  }

  if (recipeType === RecipeType.SmithingTrim && supportsSmithingTrimPattern(version)) {
    options.smithing = { trimPattern: recipe.smithing.trimPattern };
  }

  if (isBedrock) {
    const supportsPriority =
      getRecipeDefinition(recipeType).getBedrockMeta?.(recipe).supportsPriority === true;

    options.bedrock = {
      identifierMode: recipe.bedrock.identifierMode,
      identifierName: recipe.bedrock.identifierName,
      ...(supportsPriority ? { priority: recipe.bedrock.priority } : {}),
    };
  }

  return options;
};

const summarizeSlots = (
  recipe: Recipe,
  slotContext: SlotContext,
): Partial<Record<RecipeSlot, SlotSummary>> => {
  const slots: Partial<Record<RecipeSlot, SlotSummary>> = {};

  for (const [slot, value] of Object.entries(recipe.slots) as [
    RecipeSlot,
    RecipeSlotValue | undefined,
  ][]) {
    if (!value) {
      continue;
    }

    const display = getSlotDisplay(value, slotContext);
    const count = getSlotCount(value);

    slots[slot] = {
      ref: formatIngredientRef(value, slotContext),
      label: display?.label ?? "",
      ...(count !== undefined ? { count } : {}),
      ...(display?.missing ? { missing: true } : {}),
    };
  }

  return slots;
};

export const summarizeRecipe = ({
  recipe,
  recipes,
  slotContext,
  bedrockNamespace,
  warnings = [],
}: {
  recipe: Recipe;
  recipes: Recipe[];
  slotContext: SlotContext;
  bedrockNamespace: string;
  warnings?: string[];
}): RecipeSummary => {
  const { version } = slotContext;
  // naming is resolved across all recipes so titles are de-duplicated
  const allRecipes = recipes.some((candidate) => candidate.id === recipe.id)
    ? recipes
    : [...recipes, recipe];
  const naming = resolveRecipeNames(allRecipes, { bedrockNamespace }, slotContext).byId[recipe.id];
  const validation = validateRecipe(recipe, version, slotContext);

  return {
    id: recipe.id,
    title: naming?.sidebarTitle ?? "",
    recipeType: recipe.recipeType,
    options: buildRecipeOptions(recipe, version),
    slots: summarizeSlots(recipe, slotContext),
    slotLayout: getSlotLayout(recipe),
    valid: validation.valid,
    errors: validation.errors,
    warnings,
  };
};

const getSelectedRecipe = (): Recipe => {
  const { recipes, selectedRecipeId } = useRecipeStore.getState();
  const recipe = recipes.find((candidate) => candidate.id === selectedRecipeId);

  if (!recipe) {
    throw new Error("No recipe is selected");
  }

  return recipe;
};

const summarizeSelectedRecipeWith = (slotContext: SlotContext, warnings: string[]): RecipeSummary =>
  summarizeRecipe({
    recipe: getSelectedRecipe(),
    recipes: useRecipeStore.getState().recipes,
    slotContext,
    bedrockNamespace: useSettingsStore.getState().bedrockNamespace,
    warnings,
  });

/** Summarizes the currently selected recipe from the live stores. Throws if none is selected. */
export const summarizeSelectedRecipe = (warnings: string[] = []): RecipeSummary =>
  summarizeSelectedRecipeWith(getSlotContext(), warnings);

const getExportName = ({
  version,
  recipes,
  selectedRecipeId,
  bedrockNamespace,
  slotContext,
}: {
  version: MinecraftVersion;
  recipes: Recipe[];
  selectedRecipeId: string;
  bedrockNamespace: string;
  slotContext: SlotContext;
}): string | undefined => {
  const naming = getCurrentRecipeName({
    recipes,
    selectedRecipeId,
    context: { bedrockNamespace },
    slotContext,
  });

  if (version === MinecraftVersion.Bedrock) {
    return naming?.resolvedBedrockIdentifier;
  }

  return naming?.resolvedJavaName ? toJavaRecipeFileName(naming.resolvedJavaName) : undefined;
};

export const summarizeEditor = (): EditorSummary => {
  const slotContext = getSlotContext();
  const { version } = slotContext;
  const { bedrockNamespace } = useSettingsStore.getState();
  const { recipes, selectedRecipeId } = useRecipeStore.getState();
  const selectedRecipe = summarizeSelectedRecipeWith(slotContext, []);
  const naming = resolveRecipeNames(recipes, { bedrockNamespace }, slotContext);
  const categoryOptions = supportsRecipeCategory(version, selectedRecipe.recipeType)
    ? getRecipeCategoryOptions(selectedRecipe.recipeType)
    : undefined;
  const exportName = getExportName({
    version,
    recipes,
    selectedRecipeId,
    bedrockNamespace,
    slotContext,
  });

  return {
    version,
    versionLabel: getMinecraftVersionLabel(version),
    bedrockNamespace,
    resourcesLoaded: slotContext.resources !== undefined,
    supportedRecipeTypes: getSupportedRecipeTypesForVersion(version),
    ...(categoryOptions ? { categoryOptions } : {}),
    recipes: recipes.map((recipe) => ({
      id: recipe.id,
      title: naming.byId[recipe.id]?.sidebarTitle ?? "",
      recipeType: recipe.recipeType,
      selected: recipe.id === selectedRecipeId,
      valid: validateRecipe(recipe, version, slotContext).valid,
    })),
    selectedRecipe,
    ...(exportName ? { exportName } : {}),
  };
};
