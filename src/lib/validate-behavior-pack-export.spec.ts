import { describe, expect, it } from "vitest";

import { SingleRecipeState } from "@/stores/recipe";

import { MinecraftVersion, RecipeType } from "@/data/types";

import { validateBehaviorPackExport } from "./validate-behavior-pack-export";

const createItem = (raw: string, version = MinecraftVersion.Bedrock) => ({
  type: "default_item" as const,
  id: {
    raw,
    id: raw.split(":").at(-1) ?? raw,
    namespace: raw.includes(":") ? raw.split(":")[0] : "minecraft",
  },
  displayName: raw,
  texture: "",
  _version: version,
});

const createCraftingRecipe = (
  slots: SingleRecipeState["slots"],
  identifier = "crafting:recipe_1",
  recipeName = "recipe_1",
): SingleRecipeState => ({
  recipeType: RecipeType.Crafting,
  recipeName,
  group: "",
  slots,
  crafting: {
    shapeless: true,
    keepWhitespace: false,
    twoByTwo: false,
  },
  cooking: {
    time: 0,
    experience: 0,
  },
  bedrock: {
    identifier,
    priority: 0,
  },
});

describe("validateBehaviorPackExport", () => {
  it("flags missing Bedrock identifiers", () => {
    const issues = validateBehaviorPackExport([
      createCraftingRecipe(
        {
          "crafting.1": createItem("minecraft:stone"),
          "crafting.result": createItem("minecraft:stone_button"),
        },
        "   ",
      ),
    ]);

    expect(issues).toEqual([
      {
        recipe: expect.any(Object),
        name: "recipe_1",
        errors: ["Add a Bedrock identifier"],
      },
    ]);
  });

  it("flags duplicate identifiers on each conflicting recipe", () => {
    const issues = validateBehaviorPackExport([
      createCraftingRecipe(
        {
          "crafting.1": createItem("minecraft:stone"),
          "crafting.result": createItem("minecraft:stone_button"),
        },
        "crafting:duplicate",
        "recipe_1",
      ),
      createCraftingRecipe(
        {
          "crafting.1": createItem("minecraft:oak_planks"),
          "crafting.result": createItem("minecraft:stick"),
        },
        "crafting:duplicate",
        "recipe_2",
      ),
    ]);

    expect(issues).toEqual([
      {
        recipe: expect.any(Object),
        name: "recipe_1",
        errors: ["Duplicate Bedrock identifier: crafting:duplicate"],
      },
      {
        recipe: expect.any(Object),
        name: "recipe_2",
        errors: ["Duplicate Bedrock identifier: crafting:duplicate"],
      },
    ]);
  });

  it("flags filename collisions from different identifiers", () => {
    const issues = validateBehaviorPackExport([
      createCraftingRecipe(
        {
          "crafting.1": createItem("minecraft:stone"),
          "crafting.result": createItem("minecraft:stone_button"),
        },
        "crafting:foo/bar",
        "recipe_1",
      ),
      createCraftingRecipe(
        {
          "crafting.1": createItem("minecraft:oak_planks"),
          "crafting.result": createItem("minecraft:stick"),
        },
        "crafting:foo_bar",
        "recipe_2",
      ),
    ]);

    expect(issues).toEqual([
      {
        recipe: expect.any(Object),
        name: "recipe_1",
        errors: ["Behavior pack filename collision: crafting_foo_bar.json"],
      },
      {
        recipe: expect.any(Object),
        name: "recipe_2",
        errors: ["Behavior pack filename collision: crafting_foo_bar.json"],
      },
    ]);
  });
});
