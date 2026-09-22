import { RecipeType } from "@/data/types";
import { type RecipeSlot, SLOTS } from "@/recipes/slots";

import type { CatalogSlotValue, GeneratedRecipeCatalogEntry } from "@/recipes/catalog/types";

import {
  getArrayField,
  getRecordField,
  isRecord,
  normalizeRecipeType,
  normalizeResourceId,
  parseIngredient,
  parseResult,
} from "./recipe-parsing";

function parseBrewingItem(value: unknown): CatalogSlotValue | null {
  if (
    !isRecord(value) ||
    Object.keys(value).some((key) => key !== "item" && key !== "potion_contents")
  )
    return null;
  if (typeof value.item !== "string" || !value.item.length) return null;
  const isTag = value.item.startsWith("#");
  const raw = isTag ? value.item.slice(1) : value.item;
  if (!/^(?:[a-z0-9_.-]+:)?[a-z0-9_./-]+$/.test(raw)) return null;
  let potion: string | undefined;
  if ("potion_contents" in value) {
    const contents = value.potion_contents;
    if (isTag || !isRecord(contents) || Object.keys(contents).some((key) => key !== "potions"))
      return null;
    if (
      typeof contents.potions !== "string" ||
      !/^(?:[a-z0-9_.-]+:)?[a-z0-9_./-]+$/.test(contents.potions)
    )
      return null;
    potion = normalizeResourceId(contents.potions);
  }
  if (isTag) return { kind: "tag", id: normalizeResourceId(raw) };
  return { kind: "item", id: normalizeResourceId(raw), ...(potion ? { potion } : {}) };
}

const brewingHandler: RecipeHandler = {
  recipeType: RecipeType.Brewing,
  rawTypes: ["brewing"],
  toEntry: ({ recipe }) => {
    if (
      Object.keys(recipe).some(
        (key) =>
          ![
            "type",
            "input",
            "reagent",
            "output",
            "group",
            "category",
            "show_notification",
          ].includes(key),
      )
    )
      return null;
    const input = parseBrewingItem(recipe.input);
    const reagent = parseBrewingItem(recipe.reagent);
    const output = recipe.output;
    if (!input || !reagent || !isRecord(output)) return null;
    if (Object.keys(output).some((key) => key !== "id" && key !== "components" && key !== "count"))
      return null;
    if ("count" in output && output.count !== 1) return null;
    if (typeof output.id !== "string" || !/^(?:[a-z0-9_.-]+:)?[a-z0-9_./-]+$/.test(output.id))
      return null;
    let potion: string | undefined;
    if ("components" in output) {
      const components = output.components;
      if (
        !isRecord(components) ||
        Object.keys(components).some((key) => key !== "minecraft:potion_contents")
      )
        return null;
      const contents = components["minecraft:potion_contents"];
      if (typeof contents === "string" && /^(?:[a-z0-9_.-]+:)?[a-z0-9_./-]+$/.test(contents)) {
        potion = normalizeResourceId(contents);
      } else {
        if (
          !isRecord(contents) ||
          Object.keys(contents).some((key) => key !== "potion") ||
          typeof contents.potion !== "string" ||
          !/^(?:[a-z0-9_.-]+:)?[a-z0-9_./-]+$/.test(contents.potion)
        )
          return null;
        potion = normalizeResourceId(contents.potion);
      }
    }
    return {
      recipeType: RecipeType.Brewing,
      slots: {
        [SLOTS.brewing.input]: input,
        [SLOTS.brewing.reagent]: reagent,
        [SLOTS.brewing.result]: {
          kind: "item",
          id: normalizeResourceId(output.id),
          ...(potion ? { potion } : {}),
        },
      },
    };
  },
};

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
  brewingHandler,
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
