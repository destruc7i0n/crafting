import { RecipeType } from "@/data/types";
import { type RecipeSlot, SLOTS } from "@/recipes/slots";

import type { CatalogSlotValue, GeneratedRecipeCatalogEntry } from "@/recipes/catalog/types";

import {
  getArrayField,
  getRecordField,
  isRecord,
  normalizeRecipeType,
  parseIngredient,
  parseResult,
} from "./recipe-parsing";

type RecipeHandlerArgs = {
  recipe: Record<string, unknown>;
};

type RecipeHandler = {
  recipeType: RecipeType;
  rawTypes: readonly string[];
  toEntry(args: RecipeHandlerArgs): GeneratedRecipeCatalogEntry | null;
};

const cleanShapelessOrder = [
  SLOTS.crafting.slot5,
  SLOTS.crafting.slot4,
  SLOTS.crafting.slot6,
  SLOTS.crafting.slot2,
  SLOTS.crafting.slot8,
  SLOTS.crafting.slot1,
  SLOTS.crafting.slot3,
  SLOTS.crafting.slot7,
  SLOTS.crafting.slot9,
] satisfies RecipeSlot[];

const craftingGridSlots = [
  [SLOTS.crafting.slot1, SLOTS.crafting.slot2, SLOTS.crafting.slot3],
  [SLOTS.crafting.slot4, SLOTS.crafting.slot5, SLOTS.crafting.slot6],
  [SLOTS.crafting.slot7, SLOTS.crafting.slot8, SLOTS.crafting.slot9],
] satisfies RecipeSlot[][];

const craftingShapedHandler: RecipeHandler = {
  recipeType: RecipeType.Crafting,
  rawTypes: ["crafting_shaped"],
  toEntry: ({ recipe }) => {
    const pattern = getArrayField(recipe, "pattern");
    const key = getRecordField(recipe, "key");
    const result = parseResult(recipe.result);

    if (!pattern || !key || !result) {
      return null;
    }

    const rows = pattern.filter((row): row is string => typeof row === "string");
    if (rows.length !== pattern.length || rows.length === 0 || rows.length > 3) {
      return null;
    }

    const width = Math.max(...rows.map((row) => row.length));
    if (width === 0 || width > 3) {
      return null;
    }

    const rowOffset = Math.min(1, craftingGridSlots.length - rows.length);
    const columnOffset = Math.floor((3 - width) / 2);
    const slots: Partial<Record<RecipeSlot, CatalogSlotValue>> = {
      [SLOTS.crafting.result]: result,
    };

    for (const [rowIndex, row] of rows.entries()) {
      for (let columnIndex = 0; columnIndex < row.length; columnIndex += 1) {
        const symbol = row[columnIndex];
        if (symbol === " ") {
          continue;
        }

        const ingredient = parseIngredient(key[symbol]);
        if (!ingredient) {
          return null;
        }

        const slot = craftingGridSlots[rowOffset + rowIndex]?.[columnOffset + columnIndex];
        if (!slot) {
          return null;
        }

        slots[slot] = ingredient;
      }
    }

    return { recipeType: RecipeType.Crafting, slots };
  },
};

const craftingShapelessHandler: RecipeHandler = {
  recipeType: RecipeType.Crafting,
  rawTypes: ["crafting_shapeless"],
  toEntry: ({ recipe }) => {
    const ingredients = getArrayField(recipe, "ingredients");
    const result = parseResult(recipe.result);

    if (!ingredients || !result || ingredients.length === 0 || ingredients.length > 9) {
      return null;
    }

    const slots: Partial<Record<RecipeSlot, CatalogSlotValue>> = {
      [SLOTS.crafting.result]: result,
    };

    for (const [index, value] of ingredients.entries()) {
      const ingredient = parseIngredient(value);
      const slot = cleanShapelessOrder[index];

      if (!ingredient || !slot) {
        return null;
      }

      slots[slot] = ingredient;
    }

    return { recipeType: RecipeType.Crafting, slots };
  },
};

const smeltingHandler = createCookingHandler(RecipeType.Smelting, "smelting");
const blastingHandler = createCookingHandler(RecipeType.Blasting, "blasting");
const campfireCookingHandler = createCookingHandler(RecipeType.CampfireCooking, "campfire_cooking");
const smokingHandler = createCookingHandler(RecipeType.Smoking, "smoking");

const stonecuttingHandler: RecipeHandler = {
  recipeType: RecipeType.Stonecutter,
  rawTypes: ["stonecutting"],
  toEntry: ({ recipe }) => {
    const ingredient = parseIngredient(recipe.ingredient);
    const result = parseResult(recipe.result, recipe.count);

    if (!ingredient || !result) {
      return null;
    }

    return {
      recipeType: RecipeType.Stonecutter,
      slots: {
        [SLOTS.stonecutter.ingredient]: ingredient,
        [SLOTS.stonecutter.result]: result,
      },
    };
  },
};

const smithingHandler: RecipeHandler = {
  recipeType: RecipeType.Smithing,
  rawTypes: ["smithing"],
  toEntry: ({ recipe }) => {
    const base = parseIngredient(recipe.base);
    const addition = parseIngredient(recipe.addition);
    const result = parseResult(recipe.result);

    if (!base || !addition || !result) {
      return null;
    }

    return {
      recipeType: RecipeType.Smithing,
      slots: {
        [SLOTS.smithing.base]: base,
        [SLOTS.smithing.addition]: addition,
        [SLOTS.smithing.result]: result,
      },
    };
  },
};

const smithingTransformHandler: RecipeHandler = {
  recipeType: RecipeType.SmithingTransform,
  rawTypes: ["smithing_transform"],
  toEntry: ({ recipe }) => {
    const template = parseIngredient(recipe.template);
    const base = parseIngredient(recipe.base);
    const addition = parseIngredient(recipe.addition);
    const result = parseResult(recipe.result);

    if (!template || !base || !addition || !result) {
      return null;
    }

    return {
      recipeType: RecipeType.SmithingTransform,
      slots: {
        [SLOTS.smithing.template]: template,
        [SLOTS.smithing.base]: base,
        [SLOTS.smithing.addition]: addition,
        [SLOTS.smithing.result]: result,
      },
    };
  },
};

const handlers = [
  craftingShapedHandler,
  craftingShapelessHandler,
  smeltingHandler,
  blastingHandler,
  campfireCookingHandler,
  smokingHandler,
  stonecuttingHandler,
  smithingHandler,
  smithingTransformHandler,
] satisfies RecipeHandler[];

export function buildRecipeCatalogEntry({
  recipe,
}: {
  recipe: unknown;
}): GeneratedRecipeCatalogEntry | null {
  if (!isRecord(recipe)) {
    return null;
  }

  const rawType = normalizeRecipeType(recipe.type);
  if (
    !rawType ||
    rawType.startsWith("crafting_special_") ||
    rawType === "smithing_trim" ||
    rawType === "crafting_transmute"
  ) {
    return null;
  }

  const handler = handlers.find((entry) => entry.rawTypes.includes(rawType));
  if (!handler) {
    return null;
  }

  return handler.toEntry({ recipe });
}

function createCookingHandler(recipeType: RecipeHandler["recipeType"], rawType: string) {
  return {
    recipeType,
    rawTypes: [rawType],
    toEntry: ({ recipe }) => {
      const ingredient = parseIngredient(recipe.ingredient);
      const result = parseResult(recipe.result);

      if (!ingredient || !result) {
        return null;
      }

      return {
        recipeType,
        slots: {
          [SLOTS.cooking.ingredient]: ingredient,
          [SLOTS.cooking.result]: result,
        },
      };
    },
  } satisfies RecipeHandler;
}
