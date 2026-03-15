import { SingleRecipeState } from "@/stores/recipe";

import { generate } from "./cooking";
import { MinecraftVersion, RecipeType } from "../types";

describe("generate cooking", () => {
  describe("1.13", () => {
    it("should generate a smelting recipe", () => {
      const recipeSlice: SingleRecipeState = {
        recipeType: RecipeType.Smelting,
        group: "",
        slots: {
          "cooking.ingredient": {
            type: "default_item",
            id: { raw: "minecraft:stone", id: "stone", namespace: "minecraft" },
            displayName: "stone",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V113,
          },
          "cooking.result": {
            type: "default_item",
            id: {
              raw: "minecraft:cobblestone",
              id: "cobblestone",
              namespace: "minecraft",
            },
            displayName: "cobblestone",
            texture: "",
            count: 10,
            _version: MinecraftVersion.V113,
          },
        },
        crafting: {
          shapeless: true,
          keepWhitespace: false,
        },
        cooking: {
          time: 10,
          experience: 10,
        },
      };
      expect(generate(recipeSlice, MinecraftVersion.V113)).toEqual({
        type: "smelting",
        ingredient: {
          item: "minecraft:stone",
        },
        result: "minecraft:cobblestone",
        experience: 10,
        cookingtime: 10,
      });
    });
  });

  describe("1.14 - 1.20", () => {
    it("should generate a smelting recipe", () => {
      const recipeSlice: SingleRecipeState = {
        recipeType: RecipeType.Smelting,
        group: "",
        slots: {
          "cooking.ingredient": {
            type: "default_item",
            id: {
              raw: "minecraft:porkchop",
              id: "porkchop",
              namespace: "minecraft",
            },
            displayName: "stone",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V114,
          },
          "cooking.result": {
            type: "default_item",
            id: {
              raw: "minecraft:cooked_porkchop",
              id: "cooked_porkchop",
              namespace: "minecraft",
            },
            displayName: "cobblestone",
            texture: "",
            count: 10,
            _version: MinecraftVersion.V114,
          },
        },
        crafting: {
          shapeless: true,
          keepWhitespace: false,
        },
        cooking: {
          time: 10,
          experience: 10,
        },
      };
      expect(generate(recipeSlice, MinecraftVersion.V114)).toEqual({
        type: "minecraft:smelting",
        ingredient: {
          item: "minecraft:porkchop",
        },
        result: "minecraft:cooked_porkchop",
        experience: 10,
        cookingtime: 10,
      });
    });

    it("should generate a campfire cooking recipe", () => {
      const recipeSlice: SingleRecipeState = {
        recipeType: RecipeType.CampfireCooking,
        group: "",
        slots: {
          "cooking.ingredient": {
            type: "default_item",
            id: {
              raw: "minecraft:potato",
              id: "potato",
              namespace: "minecraft",
            },
            displayName: "potato",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V114,
          },
          "cooking.result": {
            type: "default_item",
            id: {
              raw: "minecraft:baked_potato",
              id: "baked_potato",
              namespace: "minecraft",
            },
            displayName: "baked_potato",
            texture: "",
            count: 10,
            _version: MinecraftVersion.V114,
          },
        },
        crafting: {
          shapeless: true,
          keepWhitespace: false,
        },
        cooking: {
          time: 10,
          experience: 10,
        },
      };
      expect(generate(recipeSlice, MinecraftVersion.V114)).toEqual({
        type: "minecraft:campfire_cooking",
        ingredient: {
          item: "minecraft:potato",
        },
        result: "minecraft:baked_potato",
        experience: 10,
        cookingtime: 10,
      });
    });

    it("should generate a smoking recipe", () => {
      const recipeSlice: SingleRecipeState = {
        recipeType: RecipeType.Smoking,
        group: "",
        slots: {
          "cooking.ingredient": {
            type: "default_item",
            id: { raw: "minecraft:beef", id: "beef", namespace: "minecraft" },
            displayName: "beef",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V114,
          },
          "cooking.result": {
            type: "default_item",
            id: {
              raw: "minecraft:cooked_beef",
              id: "cooked_beef",
              namespace: "minecraft",
            },
            displayName: "cooked_beef",
            texture: "",
            count: 10,
            _version: MinecraftVersion.V114,
          },
        },
        crafting: {
          shapeless: true,
          keepWhitespace: false,
        },
        cooking: {
          time: 10,
          experience: 10,
        },
      };
      expect(generate(recipeSlice, MinecraftVersion.V114)).toEqual({
        type: "minecraft:smoking",
        ingredient: {
          item: "minecraft:beef",
        },
        result: "minecraft:cooked_beef",
        experience: 10,
        cookingtime: 10,
      });
    });

    it("should generate a blasting recipe", () => {
      const recipeSlice: SingleRecipeState = {
        recipeType: RecipeType.Blasting,
        group: "",
        slots: {
          "cooking.ingredient": {
            type: "default_item",
            id: {
              raw: "minecraft:iron_ore",
              id: "iron_ore",
              namespace: "minecraft",
            },
            displayName: "iron_ore",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V114,
          },
          "cooking.result": {
            type: "default_item",
            id: {
              raw: "minecraft:iron_ingot",
              id: "iron_ingot",
              namespace: "minecraft",
            },
            displayName: "iron_ingot",
            texture: "",
            count: 10,
            _version: MinecraftVersion.V114,
          },
        },
        crafting: {
          shapeless: true,
          keepWhitespace: false,
        },
        cooking: {
          time: 10,
          experience: 10,
        },
      };
      expect(generate(recipeSlice, MinecraftVersion.V114)).toEqual({
        type: "minecraft:blasting",
        ingredient: {
          item: "minecraft:iron_ore",
        },
        result: "minecraft:iron_ingot",
        experience: 10,
        cookingtime: 10,
      });
    });
  });

  describe("1.21+ and bedrock", () => {
    it("should generate 1.21 cooking with object result", () => {
      const recipeSlice: SingleRecipeState = {
        recipeType: RecipeType.Smelting,
        group: "",
        slots: {
          "cooking.ingredient": {
            type: "default_item",
            id: { raw: "minecraft:iron_ore", id: "iron_ore", namespace: "minecraft" },
            displayName: "iron_ore",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V121,
          },
          "cooking.result": {
            type: "default_item",
            id: { raw: "minecraft:iron_ingot", id: "iron_ingot", namespace: "minecraft" },
            displayName: "iron_ingot",
            texture: "",
            count: 2,
            _version: MinecraftVersion.V121,
          },
        },
        crafting: { shapeless: true, keepWhitespace: false },
        cooking: { time: 0, experience: 0 },
      };

      expect(generate(recipeSlice, MinecraftVersion.V121)).toEqual({
        type: "minecraft:smelting",
        category: "misc",
        ingredient: { item: "minecraft:iron_ore" },
        result: { id: "minecraft:iron_ingot", count: 2 },
        experience: 0,
        cookingtime: 0,
      });
    });

    it("should generate bedrock furnace body", () => {
      const recipeSlice: SingleRecipeState = {
        recipeType: RecipeType.Smelting,
        group: "",
        slots: {
          "cooking.ingredient": {
            type: "default_item",
            id: { raw: "minecraft:sand", id: "sand", namespace: "minecraft" },
            displayName: "sand",
            texture: "",
            count: 1,
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
      };

      expect(generate(recipeSlice, MinecraftVersion.Bedrock)).toEqual({
        input: { item: "minecraft:sand" },
        output: { item: "minecraft:glass", count: 1 },
      });
    });

    it("should emit category for supported cooking recipes", () => {
      const recipeSlice: SingleRecipeState = {
        recipeType: RecipeType.Blasting,
        group: "",
        category: "blocks",
        slots: {
          "cooking.ingredient": {
            type: "default_item",
            id: { raw: "minecraft:iron_ore", id: "iron_ore", namespace: "minecraft" },
            displayName: "iron_ore",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V119,
          },
          "cooking.result": {
            type: "default_item",
            id: { raw: "minecraft:iron_ingot", id: "iron_ingot", namespace: "minecraft" },
            displayName: "iron_ingot",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V119,
          },
        },
        crafting: { shapeless: true, keepWhitespace: false },
        cooking: { time: 100, experience: 0.5 },
      };

      expect(generate(recipeSlice, MinecraftVersion.V119)).toEqual({
        type: "minecraft:blasting",
        category: "blocks",
        ingredient: { item: "minecraft:iron_ore" },
        result: "minecraft:iron_ingot",
        experience: 0.5,
        cookingtime: 100,
      });
    });
  });
});
