import { SingleRecipeState } from "@/stores/recipe";

import {
  get112ItemOutputFormat,
  get113ItemOutputFormat,
  get121ItemOutputFormat,
} from "./shared";
import { Item } from "../models/types";
import {
  MinecraftVersion,
  Shaped121RecipeFormat,
  Shapeless121RecipeFormat,
} from "../types";
import {
  Shaped112RecipeFormat,
  Shaped114RecipeFormat,
  Shapeless112RecipeFormat,
  Shapeless114RecipeFormat,
} from "../types";

const PATTERN_CHARACTERS = [
  "#",
  ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  ..."abcdefghijklmnopqrstuvwxyz",
];

function getPattern(
  grid: (Item | undefined)[],
  reverseMap: Record<string, string>,
  keepWhitespace: boolean,
): string[] {
  const pattern: string[] = [];

  for (const [index, item] of grid.entries()) {
    const rowIndex = Math.floor(index / 3);
    pattern[rowIndex] = pattern[rowIndex] || "";
    if (item) {
      pattern[rowIndex] += reverseMap[item.id.raw];
    } else if (keepWhitespace) {
      pattern[rowIndex] += " ";
    }
  }

  if (!keepWhitespace) {
    while (pattern[0].trim() === "") pattern.shift();
    while (pattern[pattern.length - 1].trim() === "") pattern.pop();

    // pad the pattern with whitespace to make it rectangular
    const maxLength = Math.max(...pattern.map((row) => row.length));
    for (let i = 0; i < pattern.length; i++) {
      while (pattern[i].length < maxLength) pattern[i] += " ";
    }
  }

  return pattern;
}

function dinnerboneChallenge(item: Item): string | null {
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

function getKeyForGrid(grid: (Item | undefined)[]): {
  key: Record<string, Item>;
  reverse: Record<string, string>;
} {
  const key: Record<string, Item> = {};
  const reverse: Record<string, string> = {};

  for (const item of grid) {
    if (!item) continue;
    if (reverse[item.id.raw]) continue;

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
        while (keyName in key) {
          // just randomly pick a character
          keyName =
            PATTERN_CHARACTERS[
              Math.floor(Math.random() * PATTERN_CHARACTERS.length)
            ];
        }
      }
    }

    key[keyName] = item;
    reverse[item.id.raw] = keyName;
  }

  return { key, reverse };
}

export function generate(
  state: SingleRecipeState,
  version: MinecraftVersion,
): object {
  const grid: (Item | undefined)[] = [
    state.slots["crafting.1"],
    state.slots["crafting.2"],
    state.slots["crafting.3"],
    state.slots["crafting.4"],
    state.slots["crafting.5"],
    state.slots["crafting.6"],
    state.slots["crafting.7"],
    state.slots["crafting.8"],
    state.slots["crafting.9"],
  ];
  const populatedSlots = grid.filter(Boolean);

  const group = state.group.length > 0 ? state.group : undefined;

  const { key, reverse } = getKeyForGrid(grid);

  const hasResult = state.slots["crafting.result"] !== undefined;

  switch (version) {
    case MinecraftVersion.V112:
    case MinecraftVersion.V113:
      if (state.crafting.shapeless) {
        return {
          type: "crafting_shapeless",
          ingredients: populatedSlots.map((item) =>
            get112ItemOutputFormat(item!, false),
          ),
          group,
          result: hasResult
            ? get112ItemOutputFormat(state.slots["crafting.result"]!, true)
            : {},
        } satisfies Shapeless112RecipeFormat;
      } else {
        return {
          type: "crafting_shaped",
          pattern: getPattern(grid, reverse, state.crafting.keepWhitespace),
          key: Object.fromEntries(
            Object.entries(key).map(([keyName, item]) => [
              keyName,
              get112ItemOutputFormat(item, false),
            ]),
          ),
          group,
          result: hasResult
            ? get112ItemOutputFormat(state.slots["crafting.result"]!, true)
            : {},
        } satisfies Shaped112RecipeFormat;
      }
    case MinecraftVersion.V114:
    case MinecraftVersion.V115:
    case MinecraftVersion.V116:
    case MinecraftVersion.V117:
    case MinecraftVersion.V118:
    case MinecraftVersion.V119:
    case MinecraftVersion.V120:
      if (state.crafting.shapeless) {
        return {
          type: "minecraft:crafting_shapeless",
          ingredients: populatedSlots.map((item) =>
            get113ItemOutputFormat(item!, false),
          ),
          group,
          result: hasResult
            ? get113ItemOutputFormat(state.slots["crafting.result"]!, true)
            : {},
        } satisfies Shapeless114RecipeFormat;
      } else {
        return {
          type: "minecraft:crafting_shaped",
          pattern: getPattern(grid, reverse, state.crafting.keepWhitespace),
          key: Object.fromEntries(
            Object.entries(key).map(([keyName, item]) => [
              keyName,
              get113ItemOutputFormat(item, false),
            ]),
          ),
          group,
          result: hasResult
            ? get113ItemOutputFormat(state.slots["crafting.result"]!, true)
            : {},
        } satisfies Shaped114RecipeFormat;
      }
    case MinecraftVersion.V121:
      if (state.crafting.shapeless) {
        return {
          type: "minecraft:crafting_shapeless",
          ingredients: populatedSlots.map((item) =>
            get113ItemOutputFormat(item!, false),
          ),
          group,
          result: hasResult
            ? get121ItemOutputFormat(state.slots["crafting.result"]!, false)
            : {},
        } satisfies Shapeless121RecipeFormat;
      } else {
        return {
          type: "minecraft:crafting_shaped",
          pattern: getPattern(grid, reverse, state.crafting.keepWhitespace),
          key: Object.fromEntries(
            Object.entries(key).map(([keyName, item]) => [
              keyName,
              get113ItemOutputFormat(item, false),
            ]),
          ),
          group,
          result: hasResult
            ? get121ItemOutputFormat(state.slots["crafting.result"]!, true)
            : {},
        } satisfies Shaped121RecipeFormat;
      }
    default:
      return {};
  }
}
