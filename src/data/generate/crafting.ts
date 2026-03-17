import { getRawId } from "@/data/models/identifier/utilities";
import { SingleRecipeState } from "@/stores/recipe";

import { IngredientItem } from "../models/types";
import { MinecraftVersion, SLOTS } from "../types";
import { createFormatStrategy } from "./format/item-formatter";
import { FormatStrategy } from "./format/types";
import { formatIngredient } from "./ingredient";
import {
  BedrockShapedBody,
  BedrockShapelessBody,
  CraftingInput,
  ShapedCraftingRecipe,
  ShapelessCraftingRecipe,
} from "./recipes/types";
import { isVersionAtLeast } from "./version-utils";

// Indices into the 3x3 crafting grid that are disabled in 2x2 mode:
// slots 2 (col 3), 5 (col 3, row 2), 6–8 (entire row 3)
const TWO_BY_TWO_DISABLED_INDICES = new Set([2, 5, 6, 7, 8]);

// oxlint-disable-next-line typescript/no-misused-spread
const PATTERN_CHARACTERS = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ", ..."abcdefghijklmnopqrstuvwxyz"];

function getPattern(
  grid: (IngredientItem | undefined)[],
  reverseMap: Record<string, string>,
  keepWhitespace: boolean,
): string[] {
  const pattern: string[] = [];

  for (const [index, item] of grid.entries()) {
    const rowIndex = Math.floor(index / 3);
    pattern[rowIndex] = pattern[rowIndex] || "";
    if (item) {
      pattern[rowIndex] += reverseMap[getRawId(item.id)];
    } else {
      pattern[rowIndex] += " ";
    }
  }

  if (!keepWhitespace) {
    while (pattern.length > 0 && (pattern[0] ?? "").trim() === "") pattern.shift();
    while (pattern.length > 0 && (pattern[pattern.length - 1] ?? "").trim() === "") pattern.pop();

    if (pattern.length === 0) {
      return pattern;
    }

    let minColumn = Number.POSITIVE_INFINITY;
    let maxColumn = 0;

    for (const row of pattern) {
      let firstNonWhitespace = -1;
      let lastNonWhitespace = -1;

      for (let index = 0; index < row.length; index++) {
        if (row[index] === " ") {
          continue;
        }

        if (firstNonWhitespace === -1) {
          firstNonWhitespace = index;
        }

        lastNonWhitespace = index;
      }

      if (firstNonWhitespace === -1) {
        continue;
      }

      minColumn = Math.min(minColumn, firstNonWhitespace);
      maxColumn = Math.max(maxColumn, lastNonWhitespace + 1);
    }

    for (let i = 0; i < pattern.length; i++) {
      pattern[i] = pattern[i].substring(minColumn, maxColumn);
    }
  }

  return pattern;
}

function dinnerboneChallenge(item: IngredientItem): string | null {
  if (item.type === "tag_item") {
    return null;
  }

  const itemId = item.id.id;

  const isStick = itemId.includes("stick");
  const isSlab = itemId.includes("slab");
  const isIngot = itemId.includes("ingot");
  const isNugget = itemId.includes("nugget");

  if (isStick) {
    return "/";
  }
  if (isSlab) {
    return "_";
  }
  if (isIngot) {
    return itemId[0].toLowerCase();
  }
  if (isNugget) {
    return ".";
  }
  return null;
}

function getKeyForGrid(grid: (IngredientItem | undefined)[]): {
  key: Record<string, IngredientItem>;
  reverse: Record<string, string>;
} {
  const key: Record<string, IngredientItem> = {};
  const reverse: Record<string, string> = {};

  for (const item of grid) {
    if (!item) continue;
    if (reverse[getRawId(item.id)]) continue;

    const id = item.id.id;

    let keyName = "#";
    if (keyName in key) {
      let found = false;

      const firstChar = id[0];
      const upper = firstChar.toUpperCase();
      const lower = firstChar.toLowerCase();

      const possibilities = [
        dinnerboneChallenge(item),
        upper,
        lower,
        PATTERN_CHARACTERS[id.length % PATTERN_CHARACTERS.length],
      ];

      for (const possibility of possibilities) {
        if (possibility && !(possibility in key)) {
          keyName = possibility;
          found = true;
          break;
        }
      }

      if (!found) {
        const next = PATTERN_CHARACTERS.find((c) => !(c in key));
        if (!next) throw new Error("Ran out of pattern characters");
        keyName = next;
      }
    }

    key[keyName] = item;
    reverse[getRawId(item.id)] = keyName;
  }

  return { key, reverse };
}

export const buildJava = (
  state: CraftingInput,
  formatter: FormatStrategy,
  version: MinecraftVersion,
): ShapedCraftingRecipe | ShapelessCraftingRecipe => {
  const grid = state.grid;
  const populatedSlots = grid.filter((item): item is IngredientItem => Boolean(item));

  const group = state.group.length > 0 ? state.group : undefined;
  const category = isVersionAtLeast(version, MinecraftVersion.V119) ? state.category : undefined;

  const { key, reverse } = getKeyForGrid(grid);

  const hasResult = state.result !== undefined;

  const getResult = () =>
    hasResult ? formatter.objectResult(state.result!.id, state.result!.count) : {};

  if (state.shapeless) {
    return {
      type: formatter.recipeType("crafting_shapeless") as ShapelessCraftingRecipe["type"],
      category,
      ingredients: populatedSlots.map((item) => formatIngredient(item, formatter)),
      ...(group ? { group } : {}),
      result: getResult(),
    } satisfies ShapelessCraftingRecipe;
  }

  return {
    type: formatter.recipeType("crafting_shaped") as ShapedCraftingRecipe["type"],
    category,
    ...(isVersionAtLeast(version, MinecraftVersion.V120) && state.showNotification === false
      ? { show_notification: false }
      : {}),
    pattern: getPattern(grid, reverse, state.keepWhitespace),
    key: Object.fromEntries(
      Object.entries(key).map(([keyName, item]) => [keyName, formatIngredient(item, formatter)]),
    ),
    ...(group ? { group } : {}),
    result: getResult(),
  } satisfies ShapedCraftingRecipe;
};

export const buildBedrock = (
  state: CraftingInput,
  formatter: FormatStrategy,
): BedrockShapedBody | BedrockShapelessBody => {
  const grid = state.grid;
  const populatedSlots = grid.filter((item): item is IngredientItem => Boolean(item));
  const { key, reverse } = getKeyForGrid(grid);

  const result = state.result ? formatter.objectResult(state.result.id, state.result.count) : {};

  if (state.shapeless) {
    return {
      ingredients: populatedSlots.map((item) => formatIngredient(item, formatter)),
      result,
    } satisfies BedrockShapelessBody;
  }

  return {
    pattern: getPattern(grid, reverse, state.keepWhitespace),
    key: Object.fromEntries(
      Object.entries(key).map(([keyName, item]) => [keyName, formatIngredient(item, formatter)]),
    ) as BedrockShapedBody["key"],
    result,
  } satisfies BedrockShapedBody;
};

export const extractCraftingInput = (state: SingleRecipeState): CraftingInput => ({
  grid: [
    state.slots[SLOTS.crafting.slot1],
    state.slots[SLOTS.crafting.slot2],
    state.slots[SLOTS.crafting.slot3],
    state.slots[SLOTS.crafting.slot4],
    state.slots[SLOTS.crafting.slot5],
    state.slots[SLOTS.crafting.slot6],
    state.slots[SLOTS.crafting.slot7],
    state.slots[SLOTS.crafting.slot8],
    state.slots[SLOTS.crafting.slot9],
  ].map((item, index) => {
    if (!state.crafting.twoByTwo) {
      return item;
    }

    return TWO_BY_TWO_DISABLED_INDICES.has(index) ? undefined : item;
  }),
  result: state.slots[SLOTS.crafting.result],
  shapeless: state.crafting.shapeless,
  keepWhitespace: state.crafting.keepWhitespace,
  twoByTwo: state.crafting.twoByTwo === true,
  group: state.group,
  category: state.category,
  showNotification: state.showNotification,
});

export const validateCrafting = (state: SingleRecipeState): string[] => {
  const input = extractCraftingInput(state);
  const errors: string[] = [];

  if (!input.grid.some(Boolean)) {
    errors.push("Add at least one crafting ingredient");
  }

  if (!input.result) {
    errors.push("Add a result item");
  }

  return errors;
};

export const generate = (
  state: SingleRecipeState,
  version: MinecraftVersion,
): ShapedCraftingRecipe | ShapelessCraftingRecipe | BedrockShapedBody | BedrockShapelessBody => {
  const input = extractCraftingInput(state);
  const formatter = createFormatStrategy(version);

  if (version === MinecraftVersion.Bedrock) {
    return buildBedrock(input, formatter);
  }

  return buildJava(input, formatter, version);
};
