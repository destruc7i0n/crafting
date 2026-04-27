import { describe, expect, it } from "vitest";

import { RecipeType } from "@/data/types";

import type { VersionResourceData } from "@/stores/resources";

import {
  getRecipeCardTitle,
  getRecipeFileName,
  getRecipeResult,
  getRecipeSearchText,
} from "./display";

import type { GeneratedRecipeCatalogEntry } from "./types";

const resources = {
  items: [],
  itemsById: {
    "minecraft:bone_meal": {
      type: "default_item",
      id: { namespace: "minecraft", id: "bone_meal" },
      displayName: "Bone Meal",
      texture: "bone_meal.png",
      _version: "1.21",
    },
    "minecraft:bamboo": {
      type: "default_item",
      id: { namespace: "minecraft", id: "bamboo" },
      displayName: "Bamboo",
      texture: "bamboo.png",
      _version: "1.21",
    },
    "minecraft:oak_planks": {
      type: "default_item",
      id: { namespace: "minecraft", id: "oak_planks" },
      displayName: "Oak Planks",
      texture: "oak_planks.png",
      _version: "1.21",
    },
  },
  vanillaTags: {
    "minecraft:planks": ["minecraft:oak_planks"],
  },
} as VersionResourceData;

const recipe = {
  id: "minecraft:bone_meal_from_bone_block",
  recipeType: RecipeType.Crafting,
  slots: {
    "crafting.1": { kind: "item", id: "minecraft:bone_block" },
    "crafting.result": { kind: "item", id: "minecraft:bone_meal" },
  },
} as const satisfies GeneratedRecipeCatalogEntry;

describe("recipe catalog display", () => {
  it("uses the output item display name for the card title", () => {
    expect(getRecipeCardTitle(recipe, resources)).toBe("Bone Meal");
  });

  it("exposes the concrete output slot for rendering", () => {
    expect(getRecipeResult(recipe)).toEqual({
      slot: "crafting.result",
      value: { kind: "item", id: "minecraft:bone_meal" },
    });
  });

  it("formats the displayed file name without the minecraft namespace", () => {
    expect(getRecipeFileName(recipe)).toBe("bone_meal_from_bone_block");
  });

  it("includes both recipe file and output item identity in search text", () => {
    const searchText = getRecipeSearchText(recipe, resources);

    expect(searchText).toContain("bone meal");
    expect(searchText).toContain("minecraft:bone_meal_from_bone_block");
    expect(searchText).toContain("minecraft:bone_meal");
    expect(searchText).toContain("crafting");
  });

  it("includes alternative item and tag display names in search text", () => {
    const recipeWithAlternatives = {
      id: "minecraft:stick",
      recipeType: RecipeType.Crafting,
      slots: {
        "crafting.5": {
          kind: "alternatives",
          values: [
            { kind: "item", id: "minecraft:bamboo" },
            { kind: "tag", id: "minecraft:planks" },
          ],
        },
        "crafting.result": { kind: "item", id: "minecraft:stick" },
      },
    } as const satisfies GeneratedRecipeCatalogEntry;

    const searchText = getRecipeSearchText(recipeWithAlternatives, resources);

    expect(searchText).toContain("bamboo");
    expect(searchText).toContain("minecraft:planks");
    expect(searchText).toContain("oak planks");
  });

  it("includes direct tag item display names in search text", () => {
    const recipeWithDirectTag = {
      id: "minecraft:oak_button",
      recipeType: RecipeType.Crafting,
      slots: {
        "crafting.5": { kind: "tag", id: "minecraft:planks" },
        "crafting.result": { kind: "item", id: "minecraft:oak_button" },
      },
    } as const satisfies GeneratedRecipeCatalogEntry;

    const searchText = getRecipeSearchText(recipeWithDirectTag, resources);

    expect(searchText).toContain("minecraft:planks");
    expect(searchText).toContain("minecraft:oak_planks");
    expect(searchText).toContain("oak planks");
  });
});
