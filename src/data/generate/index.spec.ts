import { SingleRecipeState, recipeStateDefaults } from "@/stores/recipe";

import { MinecraftVersion, RecipeType } from "../types";
import { generate } from "./index";

describe("generate orchestrator", () => {
  it("generates java crafting output", () => {
    const state: SingleRecipeState = {
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
    };

    expect(generate(state, MinecraftVersion.V121)).toEqual({
      type: "minecraft:crafting_shapeless",
      ingredients: [{ item: "minecraft:stone" }],
      result: { id: "minecraft:stone_button", count: 1 },
    });
  });

  it("wraps bedrock furnace output", () => {
    const state: SingleRecipeState = {
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
      bedrock: { identifier: "crafting:test", priority: 0 },
    };

    expect(generate(state, MinecraftVersion.Bedrock)).toEqual({
      format_version: "1.20.10",
      "minecraft:recipe_furnace": {
        description: { identifier: "crafting:test" },
        tags: ["furnace"],
        input: { item: "minecraft:sand" },
        output: { item: "minecraft:glass", count: 1 },
      },
    });
  });

  it("uses smithing transform wrapper metadata for bedrock", () => {
    const state: SingleRecipeState = {
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
      bedrock: { identifier: "smithing:upgrade", priority: 2 },
    };

    expect(generate(state, MinecraftVersion.Bedrock)).toEqual({
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

  it("generates bedrock brewing container recipe", () => {
    const state: SingleRecipeState = {
      ...recipeStateDefaults,
      recipeType: RecipeType.BrewingContainer,
      group: "",
      slots: {
        "brewing.input": {
          type: "default_item",
          id: { id: "glass_bottle", namespace: "minecraft" },
          displayName: "glass_bottle",
          texture: "",
          _version: MinecraftVersion.Bedrock,
        },
        "brewing.reagent": {
          type: "default_item",
          id: { id: "water_bucket", namespace: "minecraft" },
          displayName: "water_bucket",
          texture: "",
          _version: MinecraftVersion.Bedrock,
        },
        "brewing.result": {
          type: "default_item",
          id: { id: "water_bottle", namespace: "minecraft" },
          displayName: "water_bottle",
          texture: "",
          _version: MinecraftVersion.Bedrock,
        },
      },
      crafting: { ...recipeStateDefaults.crafting, shapeless: false, keepWhitespace: false },
      cooking: { time: 0, experience: 0 },
      bedrock: { identifier: "brewing:container_test", priority: 0 },
    };

    expect(generate(state, MinecraftVersion.Bedrock)).toEqual({
      format_version: "1.20.10",
      "minecraft:recipe_brewing_container": {
        description: { identifier: "brewing:container_test" },
        tags: ["brewing_stand"],
        input: { item: "minecraft:glass_bottle" },
        reagent: { item: "minecraft:water_bucket" },
        output: { item: "minecraft:water_bottle" },
      },
    });
  });

  it("generates bedrock brewing mix recipe", () => {
    const state: SingleRecipeState = {
      ...recipeStateDefaults,
      recipeType: RecipeType.BrewingMix,
      group: "",
      slots: {
        "brewing.input": {
          type: "default_item",
          id: { id: "water_bottle", namespace: "minecraft" },
          displayName: "water_bottle",
          texture: "",
          _version: MinecraftVersion.Bedrock,
        },
        "brewing.reagent": {
          type: "default_item",
          id: { id: "nether_wart", namespace: "minecraft" },
          displayName: "nether_wart",
          texture: "",
          _version: MinecraftVersion.Bedrock,
        },
        "brewing.result": {
          type: "default_item",
          id: { id: "awkward_potion", namespace: "minecraft" },
          displayName: "awkward_potion",
          texture: "",
          _version: MinecraftVersion.Bedrock,
        },
      },
      crafting: { ...recipeStateDefaults.crafting, shapeless: false, keepWhitespace: false },
      cooking: { time: 0, experience: 0 },
      bedrock: { identifier: "brewing:mix_test", priority: 0 },
    };

    expect(generate(state, MinecraftVersion.Bedrock)).toEqual({
      format_version: "1.20.10",
      "minecraft:recipe_brewing_mix": {
        description: { identifier: "brewing:mix_test" },
        tags: ["brewing_stand"],
        input: { item: "minecraft:water_bottle" },
        reagent: { item: "minecraft:nether_wart" },
        output: { item: "minecraft:awkward_potion" },
      },
    });
  });

  it("throws when bedrock recipe has no identifier", () => {
    const state: SingleRecipeState = {
      ...recipeStateDefaults,
      recipeType: RecipeType.Crafting,
      group: "",
      slots: {},
      crafting: { ...recipeStateDefaults.crafting, shapeless: false, keepWhitespace: false },
      cooking: { time: 0, experience: 0 },
      bedrock: { identifier: "", priority: 0 },
    };

    expect(() => generate(state, MinecraftVersion.Bedrock)).toThrow(
      "Bedrock recipes must have an identifier",
    );
  });

  it("throws when bedrock recipe has whitespace-only identifier", () => {
    const state: SingleRecipeState = {
      ...recipeStateDefaults,
      recipeType: RecipeType.Crafting,
      group: "",
      slots: {},
      crafting: { ...recipeStateDefaults.crafting, shapeless: false, keepWhitespace: false },
      cooking: { time: 0, experience: 0 },
      bedrock: { identifier: "   ", priority: 0 },
    };

    expect(() => generate(state, MinecraftVersion.Bedrock)).toThrow(
      "Bedrock recipes must have an identifier",
    );
  });
});
