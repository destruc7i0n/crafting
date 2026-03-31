import { describe, expect, it } from "vitest";

import { MinecraftVersion, RecipeType } from "@/data/types";
import { SingleRecipeState, recipeStateDefaults } from "@/stores/recipe";

import { validateDatapackExport } from "./validate-datapack-export";

let recipeId = 0;

const createItem = (raw: string, version = MinecraftVersion.V121) => ({
  type: "default_item" as const,
  id: {
    raw,
    id: raw.split(":").at(-1) ?? raw,
    namespace: raw.includes(":") ? raw.split(":")[0] : "minecraft",
  },
  displayName: raw.split(":").at(-1) ?? raw,
  texture: "",
  _version: version,
});

const createCraftingRecipe = (
  slots: SingleRecipeState["slots"],
  overrides: Partial<SingleRecipeState> = {},
): SingleRecipeState => ({
  ...recipeStateDefaults,
  id: overrides.id ?? `recipe-${(recipeId += 1)}`,
  recipeType: RecipeType.Crafting,
  slots,
  crafting: { ...recipeStateDefaults.crafting, shapeless: true },
  ...overrides,
});

describe("validateDatapackExport", () => {
  it("rewrites duplicate auto filenames before export", () => {
    const issues = validateDatapackExport(
      [
        createCraftingRecipe({
          "crafting.1": createItem("minecraft:stone"),
          "crafting.result": createItem("minecraft:stone_button"),
        }),
        createCraftingRecipe({
          "crafting.1": createItem("minecraft:oak_planks"),
          "crafting.result": createItem("minecraft:stone_button"),
        }),
      ],
      MinecraftVersion.V121,
      { bedrockNamespace: "crafting" },
    );

    expect(issues).toEqual([]);
  });

  it("flags blank manual file names before export", () => {
    const issues = validateDatapackExport(
      [
        createCraftingRecipe(
          {
            "crafting.1": createItem("minecraft:stone"),
            "crafting.result": createItem("minecraft:stone_button"),
          },
          { nameMode: "manual", name: "" },
        ),
      ],
      MinecraftVersion.V121,
      { bedrockNamespace: "crafting" },
    );

    expect(issues).toEqual([
      {
        recipe: expect.any(Object),
        name: "stone_button",
        errors: ["Add a file name"],
      },
    ]);
  });

  it("does not flag autos when only a similar manual suffix exists", () => {
    const issues = validateDatapackExport(
      [
        createCraftingRecipe(
          {
            "crafting.1": createItem("minecraft:stone"),
            "crafting.result": createItem("minecraft:stick_2"),
          },
          { nameMode: "manual", name: "stick_2" },
        ),
        createCraftingRecipe({
          "crafting.1": createItem("minecraft:oak_planks"),
          "crafting.result": createItem("minecraft:stick"),
        }),
      ],
      MinecraftVersion.V121,
      { bedrockNamespace: "crafting" },
    );

    expect(issues).toEqual([]);
  });
});
