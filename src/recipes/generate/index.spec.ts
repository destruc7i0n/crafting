import { MinecraftVersion, RecipeType } from "@/data/types";
import { recipeStateDefaults } from "@/stores/recipe/types";
import { makeRecipe } from "@/test/recipe-fixtures";

import { generate } from "./index";

describe("generate orchestrator", () => {
  it("generates java crafting output", () => {
    const state = makeRecipe({
      ...recipeStateDefaults,
      recipeType: RecipeType.Crafting,
      group: "",
      slots: {
        "crafting.1": {
          type: "default_item",
          id: { id: "stone", namespace: "minecraft" },
          displayName: "stone",
          texture: "",
          _version: MinecraftVersion.V121,
        },
        "crafting.result": {
          type: "default_item",
          id: {
            id: "stone_button",
            namespace: "minecraft",
          },
          displayName: "stone_button",
          texture: "",
          count: 1,
          _version: MinecraftVersion.V121,
        },
      },
      crafting: { ...recipeStateDefaults.crafting, shapeless: true, keepWhitespace: false },
      cooking: { time: 0, experience: 0 },
    });

    expect(generate({ state, version: MinecraftVersion.V121 })).toEqual({
      type: "minecraft:crafting_shapeless",
      ingredients: [{ item: "minecraft:stone" }],
      result: { id: "minecraft:stone_button", count: 1 },
    });
  });

  it("wraps bedrock furnace output", () => {
    const state = makeRecipe({
      ...recipeStateDefaults,
      recipeType: RecipeType.Smelting,
      group: "",
      slots: {
        "cooking.ingredient": {
          type: "default_item",
          id: { id: "sand", namespace: "minecraft" },
          displayName: "sand",
          texture: "",
          _version: MinecraftVersion.Bedrock,
        },
        "cooking.result": {
          type: "default_item",
          id: { id: "glass", namespace: "minecraft" },
          displayName: "glass",
          texture: "",
          count: 1,
          _version: MinecraftVersion.Bedrock,
        },
      },
      crafting: { ...recipeStateDefaults.crafting, shapeless: true, keepWhitespace: false },
      cooking: { time: 0, experience: 0 },
      bedrock: { identifierMode: "auto", identifierName: "", priority: 0 },
    });

    expect(
      generate({
        state,
        version: MinecraftVersion.Bedrock,
        options: { bedrockIdentifier: "crafting:test" },
      }),
    ).toEqual({
      format_version: "1.20.10",
      "minecraft:recipe_furnace": {
        description: { identifier: "crafting:test" },
        tags: ["furnace"],
        input: "minecraft:sand",
        output: "minecraft:glass",
      },
    });
  });

  it("uses smithing transform wrapper metadata for bedrock", () => {
    const state = makeRecipe({
      ...recipeStateDefaults,
      recipeType: RecipeType.SmithingTransform,
      group: "",
      slots: {
        "smithing.template": {
          type: "default_item",
          id: {
            id: "netherite_upgrade_smithing_template",
            namespace: "minecraft",
          },
          displayName: "template",
          texture: "",
          _version: MinecraftVersion.Bedrock,
        },
        "smithing.base": {
          type: "default_item",
          id: { id: "diamond_sword", namespace: "minecraft" },
          displayName: "base",
          texture: "",
          _version: MinecraftVersion.Bedrock,
        },
        "smithing.addition": {
          type: "default_item",
          id: { id: "netherite_ingot", namespace: "minecraft" },
          displayName: "addition",
          texture: "",
          _version: MinecraftVersion.Bedrock,
        },
        "smithing.result": {
          type: "default_item",
          id: { id: "netherite_sword", namespace: "minecraft" },
          displayName: "result",
          texture: "",
          _version: MinecraftVersion.Bedrock,
        },
      },
      crafting: { ...recipeStateDefaults.crafting, shapeless: false, keepWhitespace: false },
      cooking: { time: 0, experience: 0 },
      bedrock: { identifierMode: "auto", identifierName: "", priority: 2 },
    });

    expect(
      generate({
        state,
        version: MinecraftVersion.Bedrock,
        options: { bedrockIdentifier: "smithing:upgrade" },
      }),
    ).toEqual({
      format_version: "1.20.10",
      "minecraft:recipe_smithing_transform": {
        description: { identifier: "smithing:upgrade" },
        tags: ["smithing_table"],
        priority: 2,
        template: "minecraft:netherite_upgrade_smithing_template",
        base: "minecraft:diamond_sword",
        addition: "minecraft:netherite_ingot",
        result: "minecraft:netherite_sword",
      },
    });
  });

  it("throws when bedrock recipe has no identifier", () => {
    const state = makeRecipe({
      ...recipeStateDefaults,
      recipeType: RecipeType.Crafting,
      group: "",
      slots: {},
      crafting: { ...recipeStateDefaults.crafting, shapeless: false, keepWhitespace: false },
      cooking: { time: 0, experience: 0 },
      bedrock: { identifierMode: "auto", identifierName: "", priority: 0 },
    });

    expect(() => generate({ state, version: MinecraftVersion.Bedrock })).toThrow(
      "Bedrock recipes must have an identifier",
    );
  });

  it("throws when bedrock recipe has whitespace-only identifier", () => {
    const state = makeRecipe({
      ...recipeStateDefaults,
      recipeType: RecipeType.Crafting,
      group: "",
      slots: {},
      crafting: { ...recipeStateDefaults.crafting, shapeless: false, keepWhitespace: false },
      cooking: { time: 0, experience: 0 },
      bedrock: { identifierMode: "auto", identifierName: "", priority: 0 },
    });

    expect(() =>
      generate({
        state,
        version: MinecraftVersion.Bedrock,
        options: { bedrockIdentifier: "   " },
      }),
    ).toThrow("Bedrock recipes must have an identifier");
  });

  it("throws when bedrock recipe has invalid identifier syntax", () => {
    const state = makeRecipe({
      ...recipeStateDefaults,
      recipeType: RecipeType.Crafting,
      group: "",
      slots: {},
      crafting: { ...recipeStateDefaults.crafting, shapeless: false, keepWhitespace: false },
      cooking: { time: 0, experience: 0 },
      bedrock: { identifierMode: "auto", identifierName: "", priority: 0 },
    });

    expect(() =>
      generate({
        state,
        version: MinecraftVersion.Bedrock,
        options: { bedrockIdentifier: "Crafting:Bad-Id" },
      }),
    ).toThrow("Bedrock recipes must use a valid identifier");
  });
});
