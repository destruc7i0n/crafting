import { describe, expect, it } from "vitest";

import { SingleRecipeState } from "@/stores/recipe";

import { MinecraftVersion, RecipeType } from "@/data/types";

import { validateDatapackExport } from "./validate-datapack-export";

const createItem = (raw: string, version = MinecraftVersion.V121) => ({
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
});

describe("validateDatapackExport", () => {
  it("flags duplicate emitted filenames on each conflicting recipe", () => {
    const issues = validateDatapackExport(
      [
        createCraftingRecipe(
          {
            "crafting.1": createItem("minecraft:stone"),
            "crafting.result": createItem("minecraft:stone_button"),
          },
          "sticks",
        ),
        createCraftingRecipe(
          {
            "crafting.1": createItem("minecraft:oak_planks"),
            "crafting.result": createItem("minecraft:stick"),
          },
          "sticks",
        ),
      ],
      MinecraftVersion.V121,
    );

    expect(issues).toEqual([
      {
        recipe: expect.any(Object),
        name: "sticks",
        errors: ["Duplicate datapack filename: sticks.json"],
      },
      {
        recipe: expect.any(Object),
        name: "sticks",
        errors: ["Duplicate datapack filename: sticks.json"],
      },
    ]);
  });

  it("flags missing file names before export", () => {
    const issues = validateDatapackExport(
      [
        createCraftingRecipe(
          {
            "crafting.1": createItem("minecraft:stone"),
            "crafting.result": createItem("minecraft:stone_button"),
          },
          "",
        ),
      ],
      MinecraftVersion.V121,
    );

    expect(issues).toEqual([
      {
        recipe: expect.any(Object),
        name: "(unnamed)",
        errors: ["Add a file name"],
      },
    ]);
  });
});
