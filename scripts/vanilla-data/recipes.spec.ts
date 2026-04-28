import { describe, expect, it } from "vitest";

import { RecipeType } from "@/data/types";

import type { GeneratedRecipeCatalogEntry } from "@/recipes/catalog/types";
import type { RecipeSlot } from "@/recipes/slots";

import { compareRecipeCatalogEntries } from "./recipe-order";

describe("compareRecipeCatalogEntries", () => {
  it("uses creative item order before recipe id alpha order", () => {
    const itemGroupOrder = new Map([
      ["minecraft:oak_planks", 0],
      ["minecraft:stone", 1],
    ]);
    const recipes = [
      entry({
        id: "minecraft:a_stone_recipe",
        recipeType: RecipeType.Crafting,
        outputId: "minecraft:stone",
        resultSlot: "crafting.result",
      }),
      entry({
        id: "minecraft:z_oak_planks_recipe",
        recipeType: RecipeType.Crafting,
        outputId: "minecraft:oak_planks",
        resultSlot: "crafting.result",
      }),
    ];

    recipes.sort((left, right) => compareRecipeCatalogEntries(itemGroupOrder, left, right));

    expect(recipes.map((recipe) => recipe.id)).toEqual([
      "minecraft:z_oak_planks_recipe",
      "minecraft:a_stone_recipe",
    ]);
  });

  it("uses the requested recipe type order for the same output item", () => {
    const itemGroupOrder = new Map([["minecraft:cooked_beef", 0]]);
    const recipes = [
      entry({
        id: "minecraft:cooked_beef_from_campfire_cooking",
        recipeType: RecipeType.CampfireCooking,
        outputId: "minecraft:cooked_beef",
        resultSlot: "cooking.result",
      }),
      entry({
        id: "minecraft:cooked_beef_from_smoking",
        recipeType: RecipeType.Smoking,
        outputId: "minecraft:cooked_beef",
        resultSlot: "cooking.result",
      }),
      entry({
        id: "minecraft:cooked_beef_from_blasting",
        recipeType: RecipeType.Blasting,
        outputId: "minecraft:cooked_beef",
        resultSlot: "cooking.result",
      }),
      entry({
        id: "minecraft:cooked_beef",
        recipeType: RecipeType.Smelting,
        outputId: "minecraft:cooked_beef",
        resultSlot: "cooking.result",
      }),
    ];

    recipes.sort((left, right) => compareRecipeCatalogEntries(itemGroupOrder, left, right));

    expect(recipes.map((recipe) => recipe.recipeType)).toEqual([
      RecipeType.Smelting,
      RecipeType.Blasting,
      RecipeType.Smoking,
      RecipeType.CampfireCooking,
    ]);
  });

  it("places missing creative-order outputs after known outputs with deterministic fallback", () => {
    const itemGroupOrder = new Map([["minecraft:known", 0]]);
    const recipes = [
      entry({
        id: "minecraft:z_missing",
        recipeType: RecipeType.Crafting,
        outputId: "minecraft:missing",
        resultSlot: "crafting.result",
      }),
      entry({
        id: "minecraft:known",
        recipeType: RecipeType.Crafting,
        outputId: "minecraft:known",
        resultSlot: "crafting.result",
      }),
      entry({
        id: "minecraft:a_missing",
        recipeType: RecipeType.Crafting,
        outputId: "minecraft:other_missing",
        resultSlot: "crafting.result",
      }),
    ];

    recipes.sort((left, right) => compareRecipeCatalogEntries(itemGroupOrder, left, right));

    expect(recipes.map((recipe) => recipe.id)).toEqual([
      "minecraft:known",
      "minecraft:a_missing",
      "minecraft:z_missing",
    ]);
  });
});

function entry({
  id,
  recipeType,
  outputId,
  resultSlot,
}: {
  id: string;
  recipeType: RecipeType;
  outputId: string;
  resultSlot: RecipeSlot;
}): GeneratedRecipeCatalogEntry {
  return {
    id,
    recipeType,
    slots: {
      [resultSlot]: { kind: "item", id: outputId },
    },
  };
}
