import { RecipeSliceState } from "@/store/slices/recipeSlice";

import { get112ItemOutputFormat, get113ItemOutputFormat } from "./shared";
import { Item as ItemModel } from "../models/item/Item";
import { MinecraftVersion, ShapedRecipe, ShapelessRecipe } from "../types";
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
  grid: (ItemModel | undefined)[],
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

function dinnerboneChallenge(item: ItemModel): string | null {
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

function getKeyForGrid(grid: (ItemModel | undefined)[]): {
  key: Record<string, ItemModel>;
  reverse: Record<string, string>;
} {
  const key: Record<string, ItemModel> = {};
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
  recipeSlice: RecipeSliceState,
  version: MinecraftVersion,
): object {
  const grid: (ItemModel | undefined)[] = [
    recipeSlice.slots["crafting.1"],
    recipeSlice.slots["crafting.2"],
    recipeSlice.slots["crafting.3"],
    recipeSlice.slots["crafting.4"],
    recipeSlice.slots["crafting.5"],
    recipeSlice.slots["crafting.6"],
    recipeSlice.slots["crafting.7"],
    recipeSlice.slots["crafting.8"],
    recipeSlice.slots["crafting.9"],
  ];
  const populatedSlots = grid.filter(Boolean);

  const group = recipeSlice.group.length > 0 ? recipeSlice.group : undefined;

  const getOutputFormat =
    version === MinecraftVersion.V112
      ? get112ItemOutputFormat
      : get113ItemOutputFormat;

  const { key, reverse } = getKeyForGrid(grid);

  const resultItem = recipeSlice.slots["crafting.result"]
    ? getOutputFormat(recipeSlice.slots["crafting.result"]!, true)
    : {};

  const constantFields: Pick<
    ShapedRecipe | ShapelessRecipe,
    "group" | "result"
  > = {
    group,
    result: resultItem,
  };

  if (version === MinecraftVersion.V112 || version === MinecraftVersion.V113) {
    if (recipeSlice.crafting.shapeless) {
      return {
        type: "crafting_shapeless",
        ingredients: populatedSlots.map((item) =>
          getOutputFormat(item!, false),
        ),
        ...constantFields,
      } satisfies Shapeless112RecipeFormat;
    } else {
      return {
        type: "crafting_shaped",
        pattern: getPattern(grid, reverse, recipeSlice.crafting.keepWhitespace),
        key: Object.entries(key).reduce(
          (acc, [keyName, item]) => ({
            ...acc,
            [keyName]: getOutputFormat(item, false),
          }),
          {},
        ),
        ...constantFields,
      } satisfies Shaped112RecipeFormat;
    }
  } else if (
    version === MinecraftVersion.V114 ||
    version === MinecraftVersion.V115 ||
    version === MinecraftVersion.V116 ||
    version === MinecraftVersion.V117 ||
    version === MinecraftVersion.V118 ||
    version === MinecraftVersion.V119 ||
    version === MinecraftVersion.V120
  ) {
    if (recipeSlice.crafting.shapeless) {
      return {
        type: "minecraft:crafting_shapeless",
        ingredients: populatedSlots.map((item) =>
          get113ItemOutputFormat(item!, false),
        ),
        ...constantFields,
      } satisfies Shapeless114RecipeFormat;
    } else {
      return {
        type: "minecraft:crafting_shaped",
        pattern: getPattern(grid, reverse, recipeSlice.crafting.keepWhitespace),
        key: Object.entries(key).reduce(
          (acc, [keyName, item]) => ({
            ...acc,
            [keyName]: get113ItemOutputFormat(item, false),
          }),
          {},
        ),
        ...constantFields,
      } satisfies Shaped114RecipeFormat;
    }
  } else {
    // TODO
    return {};
  }
}
