import { describe, expect, it } from "vitest";

import { MinecraftVersion, RecipeType } from "@/data/types";
import { SingleRecipeState, recipeStateDefaults } from "@/stores/recipe";

import { validateBehaviorPackExport } from "./validate-behavior-pack-export";

let recipeId = 0;

const createItem = (raw: string, version = MinecraftVersion.Bedrock) => ({
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

describe("validateBehaviorPackExport", () => {
  it("flags blank manual Bedrock names", () => {
    const issues = validateBehaviorPackExport(
      [
        createCraftingRecipe(
          {
            "crafting.1": createItem("minecraft:stone"),
            "crafting.result": createItem("minecraft:stone_button"),
          },
          {
            bedrock: { identifierMode: "manual", identifierName: "", priority: 0 },
          },
        ),
      ],
      { bedrockNamespace: "crafting" },
    );

    expect(issues).toEqual([
      {
        recipe: expect.any(Object),
        name: "stone_button",
        errors: ["Add a Bedrock name"],
      },
    ]);
  });

  it("rewrites duplicate auto identifiers before export", () => {
    const issues = validateBehaviorPackExport(
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
      { bedrockNamespace: "crafting" },
    );

    expect(issues).toEqual([]);
  });

  it("flags invalid Bedrock identifier syntax", () => {
    const issues = validateBehaviorPackExport(
      [
        createCraftingRecipe(
          {
            "crafting.1": createItem("minecraft:stone"),
            "crafting.result": createItem("minecraft:stone_button"),
          },
          {
            bedrock: { identifierMode: "manual", identifierName: "Bad-Id", priority: 0 },
          },
        ),
      ],
      { bedrockNamespace: "Crafting" },
    );

    expect(issues).toEqual([
      {
        recipe: expect.any(Object),
        name: "stone_button",
        errors: ["Use a valid Bedrock identifier (namespace:name; a-z, 0-9, _)"],
      },
    ]);
  });

  it("keeps distinct manual Bedrock names valid in one namespace", () => {
    const issues = validateBehaviorPackExport(
      [
        createCraftingRecipe(
          {
            "crafting.1": createItem("minecraft:stone"),
            "crafting.result": createItem("minecraft:stone_button"),
          },
          {
            bedrock: { identifierMode: "manual", identifierName: "foo_bar", priority: 0 },
          },
        ),
        createCraftingRecipe(
          {
            "crafting.1": createItem("minecraft:oak_planks"),
            "crafting.result": createItem("minecraft:stick"),
          },
          {
            bedrock: { identifierMode: "manual", identifierName: "bar", priority: 0 },
          },
        ),
      ],
      { bedrockNamespace: "crafting_foo" },
    );

    expect(issues).toEqual([]);
  });

  it("does not flag autos when only a similar manual Bedrock suffix exists", () => {
    const issues = validateBehaviorPackExport(
      [
        createCraftingRecipe(
          {
            "crafting.1": createItem("minecraft:stone"),
            "crafting.result": createItem("minecraft:stick_2"),
          },
          {
            bedrock: { identifierMode: "manual", identifierName: "stick_2", priority: 0 },
          },
        ),
        createCraftingRecipe({
          "crafting.1": createItem("minecraft:oak_planks"),
          "crafting.result": createItem("minecraft:stick"),
        }),
      ],
      { bedrockNamespace: "crafting" },
    );

    expect(issues).toEqual([]);
  });
});
