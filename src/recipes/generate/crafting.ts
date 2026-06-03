import { getRawId } from "@/data/models/identifier/utilities";
import { MinecraftVersion, RecipeType } from "@/data/types";
import { SLOTS } from "@/recipes/slots";
import {
  getRequiredSlotIdentifier,
  getSlotCount,
  getSlotIdentifier,
  isTagSlotValue,
} from "@/stores/recipe/slot-value";
import { Recipe, RecipeSlotValue, SlotContext } from "@/stores/recipe/types";
import { supportsRecipeCategory, supportsShowNotification } from "@/versioning";

import { RecipeFormatter } from "./format/types";
import { formatIngredient } from "./ingredient";
import {
  BedrockShapedBody,
  BedrockShapelessBody,
  CraftingInput,
  ShapedCraftingRecipe,
  ShapelessCraftingRecipe,
} from "./types";

// Indices into the 3x3 crafting grid that are disabled in 2x2 mode:
// slots 2 (col 3), 5 (col 3, row 2), 6–8 (entire row 3)
const TWO_BY_TWO_DISABLED_INDICES = new Set([2, 5, 6, 7, 8]);

// oxlint-disable-next-line typescript/no-misused-spread
const PATTERN_CHARACTERS = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ", ..."abcdefghijklmnopqrstuvwxyz"];

// reverse-map key + path, shared by getPattern and getKeyForGrid so they agree
function resolveSlotKeyInfo(
  item: RecipeSlotValue,
  slotContext: SlotContext,
): { reverseKey: string; path: string } {
  const identifier = getSlotIdentifier(item, slotContext);
  if (identifier) {
    return { reverseKey: getRawId(identifier), path: identifier.id };
  }

  const uid = item.kind === "custom_item" || item.kind === "custom_tag" ? item.uid : "";
  return { reverseKey: `${item.kind}:${uid}`, path: uid };
}

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
      const { reverseKey } = resolveSlotKeyInfo(item, slotContext);
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

// thematic key chars by keyword, first match wins
const DINNERBONE_RULES: { char: string; keywords: string[] }[] = [
  { char: "/", keywords: ["stick", "rod", "torch", "arrow", "bone"] },
  { char: "_", keywords: ["slab", "carpet", "paper", "map"] },
  { char: "=", keywords: ["ingot", "brick"] },
  { char: ".", keywords: ["nugget", "dust", "powder", "seed", "redstone"] },
  { char: "o", keywords: ["diamond", "emerald", "quartz", "shard", "pearl", "ball", "egg"] },
  { char: "~", keywords: ["string", "vine"] },
  { char: ")", keywords: ["bow"] },
  { char: "u", keywords: ["bucket", "bottle"] },
];

function dinnerboneChallenge(itemId: string, isTag: boolean): string | null {
  if (isTag) {
    return null;
  }

  const normalizedId = itemId.toLowerCase();
  for (const { char, keywords } of DINNERBONE_RULES) {
    if (keywords.some((keyword) => normalizedId.includes(keyword))) {
      return char;
    }
  }

  return null;
}

// key for a non-primary ingredient: dinnerbone char -> word initials -> any other
// letter -> first free char
function pickKeyName(path: string, item: RecipeSlotValue, usedKeys: Set<string>): string {
  const candidates = [dinnerboneChallenge(path, isTagSlotValue(item))];
  // letter runs (words), split on _ / : -> initial of each
  for (const word of path.match(/[a-zA-Z]+/g) ?? []) {
    candidates.push(word[0].toUpperCase(), word[0].toLowerCase());
  }
  // every individual letter, as a fallback
  for (const letter of path.match(/[a-zA-Z]/g) ?? []) {
    candidates.push(letter.toUpperCase(), letter.toLowerCase());
  }

  for (const candidate of candidates) {
    if (candidate && !usedKeys.has(candidate)) {
      return candidate;
    }
  }

  const next = PATTERN_CHARACTERS.find((c) => !usedKeys.has(c));
  if (!next) throw new Error("Ran out of pattern characters");
  return next;
}

function getKeyForGrid(
  grid: (RecipeSlotValue | undefined)[],
  slotContext: SlotContext,
): {
  key: Record<string, RecipeSlotValue>;
  reverse: Record<string, string>;
} {
  // most-used ingredient claims "#", ties go to the earliest in the grid
  const cells: { reverseKey: string; path: string; item: RecipeSlotValue }[] = [];
  const counts = new Map<string, number>();
  let primary: string | undefined;
  let primaryCount = 0;

  for (const item of grid) {
    if (!item) continue;
    const { reverseKey, path } = resolveSlotKeyInfo(item, slotContext);
    cells.push({ reverseKey, path, item });

    const count = (counts.get(reverseKey) ?? 0) + 1;
    counts.set(reverseKey, count);
    if (count > primaryCount) {
      primary = reverseKey;
      primaryCount = count;
    }
  }

  const key: Record<string, RecipeSlotValue> = {};
  const reverse: Record<string, string> = {};
  const usedKeys = new Set<string>(["#"]); // reserved for the primary

  for (const { reverseKey, path, item } of cells) {
    if (reverse[reverseKey]) continue;

    const keyName = reverseKey === primary ? "#" : pickKeyName(path, item, usedKeys);
    key[keyName] = item;
    reverse[reverseKey] = keyName;
    usedKeys.add(keyName);
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
  const category = supportsRecipeCategory(version, RecipeType.Crafting)
    ? state.category
    : undefined;

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
      ...(supportsShowNotification(version, RecipeType.Crafting, true) &&
      state.showNotification === false
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
    ...(supportsShowNotification(version, RecipeType.Crafting, false) &&
    state.showNotification === false
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
