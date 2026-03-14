import { SingleRecipeState } from "@/stores/recipe";

import { createFormatStrategy } from "./format/item-formatter";
import { FormatStrategy } from "./format/types";
import { Item } from "../models/types";
import { MinecraftVersion } from "../types";
import {
  BedrockShapedBody,
  BedrockShapelessBody,
  CraftingInput,
  ShapedCraftingRecipe,
  ShapelessCraftingRecipe,
} from "./recipes/types";

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

export const buildJava = (
  state: CraftingInput,
  formatter: FormatStrategy,
):
  | ShapedCraftingRecipe
  | ShapelessCraftingRecipe => {
  const grid = state.grid;
  const populatedSlots = grid.filter(Boolean);

  const group = state.group.length > 0 ? state.group : undefined;

  const { key, reverse } = getKeyForGrid(grid);

  const hasResult = state.result !== undefined;

  const getResult = () =>
    hasResult ? formatter.objectResult(state.result!.id, state.result!.count) : {};

  if (state.shapeless) {
    return {
      type: formatter.recipeType("crafting_shapeless") as ShapelessCraftingRecipe["type"],
      ingredients: populatedSlots.map((item) => formatter.ingredient(item!.id)),
      group,
      result: getResult(),
    } satisfies ShapelessCraftingRecipe;
  }

  return {
    type: formatter.recipeType("crafting_shaped") as ShapedCraftingRecipe["type"],
    pattern: getPattern(grid, reverse, state.keepWhitespace),
    key: Object.fromEntries(
      Object.entries(key).map(([keyName, item]) => [
        keyName,
        formatter.ingredient(item.id),
      ]),
    ),
    group,
    result: getResult(),
  } satisfies ShapedCraftingRecipe;
};

export const buildBedrock = (
  state: CraftingInput,
  formatter: FormatStrategy,
): BedrockShapedBody | BedrockShapelessBody => {
  const grid = state.grid;
  const populatedSlots = grid.filter(Boolean);
  const { key, reverse } = getKeyForGrid(grid);

  const result = state.result
    ? formatter.objectResult(state.result.id, state.result.count)
    : {};

  if (state.shapeless) {
    return {
      ingredients: populatedSlots.map((item) => formatter.ingredient(item!.id)),
      result,
    } satisfies BedrockShapelessBody;
  }

  return {
    pattern: getPattern(grid, reverse, state.keepWhitespace),
    key: Object.fromEntries(
      Object.entries(key).map(([keyName, item]) => [
        keyName,
        formatter.ingredient(item.id),
      ]),
    ) as BedrockShapedBody["key"],
    result,
  } satisfies BedrockShapedBody;
};

const extractInput = (state: SingleRecipeState): CraftingInput => ({
  grid: [
    state.slots["crafting.1"],
    state.slots["crafting.2"],
    state.slots["crafting.3"],
    state.slots["crafting.4"],
    state.slots["crafting.5"],
    state.slots["crafting.6"],
    state.slots["crafting.7"],
    state.slots["crafting.8"],
    state.slots["crafting.9"],
  ],
  result: state.slots["crafting.result"],
  shapeless: state.crafting.shapeless,
  keepWhitespace: state.crafting.keepWhitespace,
  group: state.group,
});

export const generate = (
  state: SingleRecipeState,
  version: MinecraftVersion,
):
  | ShapedCraftingRecipe
  | ShapelessCraftingRecipe
  | BedrockShapedBody
  | BedrockShapelessBody => {
  const input = extractInput(state);
  const formatter = createFormatStrategy(version);

  if (version === MinecraftVersion.Bedrock) {
    return buildBedrock(input, formatter);
  }

  return buildJava(input, formatter);
};
