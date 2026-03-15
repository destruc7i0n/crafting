import { SingleRecipeState } from "@/stores/recipe";

import { generate } from "./index";
import { MinecraftVersion, RecipeType } from "../types";

describe("generate orchestrator", () => {
  it("generates java crafting output", () => {
    const state: SingleRecipeState = {
      recipeType: RecipeType.Crafting,
      group: "",
      slots: {
        "crafting.1": {
          type: "default_item",
          id: { raw: "minecraft:stone", id: "stone", namespace: "minecraft" },
          displayName: "stone",
          texture: "",
          _version: MinecraftVersion.V121,
        },
        "crafting.result": {
          type: "default_item",
          id: {
            raw: "minecraft:stone_button",
            id: "stone_button",
            namespace: "minecraft",
          },
          displayName: "stone_button",
          texture: "",
          count: 1,
          _version: MinecraftVersion.V121,
        },
      },
      crafting: { shapeless: true, keepWhitespace: false },
      cooking: { time: 0, experience: 0 },
    };

    expect(generate(state, MinecraftVersion.V121)).toEqual({
      type: "minecraft:crafting_shapeless",
      category: "misc",
      ingredients: [{ item: "minecraft:stone" }],
      result: { id: "minecraft:stone_button", count: 1 },
    });
  });

  it("wraps bedrock furnace output", () => {
    const state: SingleRecipeState = {
      recipeType: RecipeType.Smelting,
      group: "",
      slots: {
        "cooking.ingredient": {
          type: "default_item",
          id: { raw: "minecraft:sand", id: "sand", namespace: "minecraft" },
          displayName: "sand",
          texture: "",
          _version: MinecraftVersion.Bedrock,
        },
        "cooking.result": {
          type: "default_item",
          id: { raw: "minecraft:glass", id: "glass", namespace: "minecraft" },
          displayName: "glass",
          texture: "",
          count: 1,
          _version: MinecraftVersion.Bedrock,
        },
      },
      crafting: { shapeless: true, keepWhitespace: false },
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
      recipeType: RecipeType.SmithingTransform,
      group: "",
      slots: {
        "smithing.template": {
          type: "default_item",
          id: {
            raw: "minecraft:netherite_upgrade_smithing_template",
            id: "netherite_upgrade_smithing_template",
            namespace: "minecraft",
          },
          displayName: "template",
          texture: "",
          _version: MinecraftVersion.Bedrock,
        },
        "smithing.base": {
          type: "default_item",
          id: { raw: "minecraft:diamond_sword", id: "diamond_sword", namespace: "minecraft" },
          displayName: "base",
          texture: "",
          _version: MinecraftVersion.Bedrock,
        },
        "smithing.addition": {
          type: "default_item",
          id: { raw: "minecraft:netherite_ingot", id: "netherite_ingot", namespace: "minecraft" },
          displayName: "addition",
          texture: "",
          _version: MinecraftVersion.Bedrock,
        },
        "smithing.result": {
          type: "default_item",
          id: { raw: "minecraft:netherite_sword", id: "netherite_sword", namespace: "minecraft" },
          displayName: "result",
          texture: "",
          _version: MinecraftVersion.Bedrock,
        },
      },
      crafting: { shapeless: false, keepWhitespace: false },
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
});
