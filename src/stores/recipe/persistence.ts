import { MinecraftIdentifier } from "@/data/models/types";
import { RecipeType } from "@/data/types";
import { RecipeSlot, SLOTS } from "@/recipes/slots";

import {
  createDefaultRecipe,
  Recipe,
  RecipeSlotValue,
  RecipeState,
  recipeStateDefaults,
} from "./types";

export interface PersistedRecipe {
  id: string;
  nameMode: Recipe["nameMode"];
  name: string;
  recipeType: RecipeType;
  group: string;
  category: string;
  showNotification: boolean;
  smithing: Recipe["smithing"];
  slots: Recipe["slots"];
  crafting: {
    shapeless: boolean;
    keepWhitespace: boolean;
    twoByTwo: boolean;
  };
  cooking: {
    time: number;
    experience: number;
  };
  bedrock: {
    identifierMode: Recipe["bedrock"]["identifierMode"];
    identifierName: string;
    priority: number;
  };
}

export interface PersistedRecipeState {
  recipes: PersistedRecipe[];
  selectedRecipeId: string;
}

export const RECIPE_STORE_NAME = "crafting-recipes";
export const RECIPE_STORE_VERSION = 1;

const recipeSlots = Object.values(SLOTS).flatMap((group) => Object.values(group)) as RecipeSlot[];
const recipeSlotSet = new Set(recipeSlots);
const recipeTypes = new Set(Object.values(RecipeType));

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const pickObject = (value: unknown): Record<string, unknown> => (isRecord(value) ? value : {});

const isString = (value: unknown): value is string => typeof value === "string";
const isNonEmptyString = (value: unknown): value is string => isString(value) && value.length > 0;
const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";
const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isRecipeType = (value: unknown): value is RecipeType =>
  isString(value) && recipeTypes.has(value as RecipeType);

const isRecipeSlot = (value: string): value is RecipeSlot => recipeSlotSet.has(value as RecipeSlot);

const normalizeIdentifier = (raw: unknown): MinecraftIdentifier | undefined => {
  const value = pickObject(raw);
  if (!isNonEmptyString(value.namespace) || !isNonEmptyString(value.id)) {
    return undefined;
  }

  return {
    namespace: value.namespace,
    id: value.id,
    ...(isFiniteNumber(value.data) ? { data: value.data } : {}),
  };
};

const normalizeRecipeSlotValue = (raw: unknown): RecipeSlotValue | undefined => {
  const value = pickObject(raw);

  switch (value.kind) {
    case "item": {
      const id = normalizeIdentifier(value.id);
      if (!id) {
        return undefined;
      }

      return {
        kind: "item",
        id,
        ...(isFiniteNumber(value.count) ? { count: value.count } : {}),
      };
    }
    case "custom_item":
      return isNonEmptyString(value.uid)
        ? {
            kind: "custom_item",
            uid: value.uid,
            ...(isFiniteNumber(value.count) ? { count: value.count } : {}),
          }
        : undefined;
    case "vanilla_tag": {
      const id = normalizeIdentifier(value.id);
      return id ? { kind: "vanilla_tag", id } : undefined;
    }
    case "custom_tag":
      return isNonEmptyString(value.uid) ? { kind: "custom_tag", uid: value.uid } : undefined;
    default:
      return undefined;
  }
};

const normalizeSlots = (raw: unknown): Partial<Record<RecipeSlot, RecipeSlotValue>> => {
  const slots = pickObject(raw);
  const normalized: Partial<Record<RecipeSlot, RecipeSlotValue>> = {};

  for (const [slot, rawValue] of Object.entries(slots)) {
    if (!isRecipeSlot(slot)) {
      continue;
    }

    const value = normalizeRecipeSlotValue(rawValue);
    if (value) {
      normalized[slot] = value;
    }
  }

  return normalized;
};

const normalizeCrafting = (raw: unknown): Recipe["crafting"] => {
  const crafting = pickObject(raw);

  return {
    shapeless: isBoolean(crafting.shapeless)
      ? crafting.shapeless
      : recipeStateDefaults.crafting.shapeless,
    keepWhitespace: isBoolean(crafting.keepWhitespace)
      ? crafting.keepWhitespace
      : recipeStateDefaults.crafting.keepWhitespace,
    twoByTwo: isBoolean(crafting.twoByTwo)
      ? crafting.twoByTwo
      : recipeStateDefaults.crafting.twoByTwo,
  };
};

const normalizeCooking = (raw: unknown): Recipe["cooking"] => {
  const cooking = pickObject(raw);

  return {
    time: isFiniteNumber(cooking.time) ? cooking.time : recipeStateDefaults.cooking.time,
    experience: isFiniteNumber(cooking.experience)
      ? cooking.experience
      : recipeStateDefaults.cooking.experience,
  };
};

const normalizeBedrock = (raw: unknown): Recipe["bedrock"] => {
  const bedrock = pickObject(raw);

  return {
    identifierMode: bedrock.identifierMode === "manual" ? "manual" : "auto",
    identifierName: isString(bedrock.identifierName)
      ? bedrock.identifierName
      : recipeStateDefaults.bedrock.identifierName,
    priority: isFiniteNumber(bedrock.priority)
      ? bedrock.priority
      : recipeStateDefaults.bedrock.priority,
  };
};

const normalizeSmithing = (raw: unknown): Recipe["smithing"] => {
  const smithing = pickObject(raw);

  return {
    trimPattern: isString(smithing.trimPattern)
      ? smithing.trimPattern
      : recipeStateDefaults.smithing.trimPattern,
  };
};

const normalizeRecipe = (raw: unknown): Recipe => {
  const recipe = pickObject(raw);
  const defaultRecipe = createDefaultRecipe();

  return {
    ...defaultRecipe,
    id: isNonEmptyString(recipe.id) ? recipe.id : defaultRecipe.id,
    nameMode: recipe.nameMode === "manual" ? "manual" : "auto",
    name: isString(recipe.name) ? recipe.name : defaultRecipe.name,
    recipeType: isRecipeType(recipe.recipeType) ? recipe.recipeType : RecipeType.Crafting,
    group: isString(recipe.group) ? recipe.group : defaultRecipe.group,
    category: isString(recipe.category) ? recipe.category : defaultRecipe.category,
    showNotification: isBoolean(recipe.showNotification)
      ? recipe.showNotification
      : defaultRecipe.showNotification,
    smithing: normalizeSmithing(recipe.smithing),
    slots: normalizeSlots(recipe.slots),
    crafting: normalizeCrafting(recipe.crafting),
    cooking: normalizeCooking(recipe.cooking),
    bedrock: normalizeBedrock(recipe.bedrock),
  };
};

export const normalizePersistedRecipeState = (raw: unknown): RecipeState => {
  const value = pickObject(raw);
  const recipes = Array.isArray(value.recipes) ? value.recipes.map(normalizeRecipe) : [];
  const normalizedRecipes = recipes.length > 0 ? recipes : [createDefaultRecipe()];
  const selectedRecipeId =
    isNonEmptyString(value.selectedRecipeId) &&
    normalizedRecipes.some((recipe) => recipe.id === value.selectedRecipeId)
      ? value.selectedRecipeId
      : normalizedRecipes[0]!.id;

  return {
    recipes: normalizedRecipes,
    selectedRecipeId,
  };
};
