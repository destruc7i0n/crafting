import { getRawId } from "@/data/models/identifier/utilities";
import { createEmptySlotContext } from "@/stores/recipe/slot-value";
import {
  getRequiredSlotIdentifier,
  getSlotCount,
  getSlotIdentifier,
  isTagSlotValue,
} from "@/stores/recipe/slot-value";
import { Recipe, RecipeSlotValue, SlotContext } from "@/stores/recipe/types";

import { MinecraftVersion, SLOTS } from "../types";
import { createRecipeFormatter } from "./format/recipe-formatter";
import { RecipeFormatter } from "./format/types";
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

function getPattern({
  grid,
  reverseMap,
  slotContext,
  keepWhitespace,
}: {
  grid: (RecipeSlotValue | undefined)[];
  reverseMap: Record<string, string>;
  slotContext: SlotContext;
  keepWhitespace: boolean;
}): string[] {
  const pattern: string[] = [];

  for (const [index, item] of grid.entries()) {
    const rowIndex = Math.floor(index / 3);
    pattern[rowIndex] = pattern[rowIndex] || "";
    if (item) {
      const identifier = getSlotIdentifier(item, slotContext);
      const reverseKey = identifier ? getRawId(identifier) : item.kind;
      pattern[rowIndex] += reverseMap[reverseKey] ?? "#";
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

function dinnerboneChallenge(itemId: string, isTag: boolean): string | null {
  if (isTag) {
    return null;
  }

  const normalizedId = itemId.toLowerCase();

  if (
    normalizedId.includes("stick") ||
    normalizedId.includes("rod") ||
    normalizedId.includes("torch") ||
    normalizedId.includes("arrow") ||
    normalizedId.includes("bone")
  ) {
    return "/";
  }

  if (
    normalizedId.includes("slab") ||
    normalizedId.includes("carpet") ||
    normalizedId.includes("paper") ||
    normalizedId.includes("map")
  ) {
    return "_";
  }

  if (normalizedId.includes("ingot") || normalizedId.includes("brick")) {
    return "=";
  }

  if (
    normalizedId.includes("nugget") ||
    normalizedId.includes("dust") ||
    normalizedId.includes("powder") ||
    normalizedId.includes("seed") ||
    normalizedId.includes("redstone")
  ) {
    return ".";
  }

  if (
    normalizedId.includes("diamond") ||
    normalizedId.includes("emerald") ||
    normalizedId.includes("quartz") ||
    normalizedId.includes("shard") ||
    normalizedId.includes("pearl") ||
    normalizedId.includes("ball") ||
    normalizedId.includes("egg")
  ) {
    return "o";
  }

  if (normalizedId.includes("string") || normalizedId.includes("vine")) {
    return "~";
  }

  if (normalizedId.includes("bow")) {
    return ")";
  }

  if (normalizedId.includes("bucket") || normalizedId.includes("bottle")) {
    return "u";
  }

  return null;
}

function getKeyForGrid(
  grid: (RecipeSlotValue | undefined)[],
  slotContext: SlotContext,
): {
  key: Record<string, RecipeSlotValue>;
  reverse: Record<string, string>;
} {
  const key: Record<string, RecipeSlotValue> = {};
  const reverse: Record<string, string> = {};

  for (const item of grid) {
    if (!item) continue;
    const identifier = getSlotIdentifier(item, slotContext);
    const reverseKey = identifier
      ? getRawId(identifier)
      : `${item.kind}:${item.kind === "custom_item" || item.kind === "custom_tag" ? item.uid : ""}`;
    if (reverse[reverseKey]) continue;

    const id = reverseKey.startsWith("minecraft:")
      ? reverseKey.slice("minecraft:".length)
      : reverseKey || item.kind;

    let keyName = "#";
    if (keyName in key) {
      let found = false;

      const firstChar = id[0];
      const upper = firstChar.toUpperCase();
      const lower = firstChar.toLowerCase();

      const possibilities = [
        dinnerboneChallenge(id, isTagSlotValue(item)),
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
    reverse[reverseKey] = keyName;
  }

  return { key, reverse };
}

export const buildJava = ({
  state,
  formatter,
  version,
  slotContext,
}: {
  state: CraftingInput;
  formatter: RecipeFormatter;
  version: MinecraftVersion;
  slotContext: SlotContext;
}): ShapedCraftingRecipe | ShapelessCraftingRecipe => {
  const grid = state.grid;
  const populatedSlots = grid.filter((item): item is RecipeSlotValue => Boolean(item));

  const group = state.group.length > 0 ? state.group : undefined;
  const category = isVersionAtLeast(version, MinecraftVersion.V119) ? state.category : undefined;

  const { key, reverse } = getKeyForGrid(grid, slotContext);

  const resultCount = getSlotCount(state.result);
  const getResult = () =>
    state.result
      ? formatter.objectResult(getRequiredSlotIdentifier(state.result, slotContext), resultCount)
      : {};

  if (state.shapeless) {
    return {
      type: formatter.recipeType("crafting_shapeless") as ShapelessCraftingRecipe["type"],
      ...(category ? { category } : {}),
      ...(isVersionAtLeast(version, MinecraftVersion.V261) && state.showNotification === false
        ? { show_notification: false }
        : {}),
      ingredients: populatedSlots.map((item) => formatIngredient({ item, formatter, slotContext })),
      ...(group ? { group } : {}),
      result: getResult(),
    } satisfies ShapelessCraftingRecipe;
  }

  return {
    type: formatter.recipeType("crafting_shaped") as ShapedCraftingRecipe["type"],
    ...(category ? { category } : {}),
    ...(isVersionAtLeast(version, MinecraftVersion.V119) && state.showNotification === false
      ? { show_notification: false }
      : {}),
    pattern: getPattern({
      grid,
      reverseMap: reverse,
      slotContext,
      keepWhitespace: state.keepWhitespace,
    }),
    key: Object.fromEntries(
      Object.entries(key).map(([keyName, item]) => [
        keyName,
        formatIngredient({ item, formatter, slotContext }),
      ]),
    ),
    ...(group ? { group } : {}),
    result: getResult(),
  } satisfies ShapedCraftingRecipe;
};

export const buildBedrock = (
  state: CraftingInput,
  formatter: RecipeFormatter,
  slotContext: SlotContext,
): BedrockShapedBody | BedrockShapelessBody => {
  const grid = state.grid;
  const populatedSlots = grid.filter((item): item is RecipeSlotValue => Boolean(item));
  const { key, reverse } = getKeyForGrid(grid, slotContext);
  const resultCount = getSlotCount(state.result);
  const result = state.result
    ? formatter.objectResult(getRequiredSlotIdentifier(state.result, slotContext), resultCount)
    : {};

  if (state.shapeless) {
    return {
      ingredients: populatedSlots.map((item) => formatIngredient({ item, formatter, slotContext })),
      result,
    } satisfies BedrockShapelessBody;
  }

  return {
    pattern: getPattern({
      grid,
      reverseMap: reverse,
      slotContext,
      keepWhitespace: state.keepWhitespace,
    }),
    key: Object.fromEntries(
      Object.entries(key).map(([keyName, item]) => [
        keyName,
        formatIngredient({ item, formatter, slotContext }),
      ]),
    ) as BedrockShapedBody["key"],
    result,
  } satisfies BedrockShapedBody;
};

export const extractCraftingInput = (state: Recipe): CraftingInput => ({
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
  category: state.category || undefined,
  showNotification: state.showNotification,
});

export const validateCrafting = (state: Recipe): string[] => {
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
  state: Recipe,
  version: MinecraftVersion,
  slotContext = createEmptySlotContext(version),
): ShapedCraftingRecipe | ShapelessCraftingRecipe | BedrockShapedBody | BedrockShapelessBody => {
  const input = extractCraftingInput(state);
  const formatter = createRecipeFormatter(version);

  if (version === MinecraftVersion.Bedrock) {
    return buildBedrock(input, formatter, slotContext);
  }

  return buildJava({ state: input, formatter, version, slotContext });
};
