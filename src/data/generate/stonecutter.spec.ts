import { SingleRecipeState } from "@/stores/recipe";

import { generate } from "./stonecutter";
import { MinecraftVersion, RecipeType } from "../types";

describe("generate stonecutting", () => {
  describe("1.14", () => {
    it("should generate a stonecutting recipe", () => {
      const recipeSlice: SingleRecipeState = {
        recipeType: RecipeType.Stonecutter,
        group: "",
        slots: {
          "stonecutter.ingredient": {
            type: "default_item",
            id: { raw: "minecraft:stone", id: "", namespace: "minecraft" },
            displayName: "stone",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V114,
          },
          "stonecutter.result": {
            type: "default_item",
            id: {
              raw: "minecraft:cobblestone",
              id: "",
              namespace: "minecraft",
            },
            displayName: "cobblestone",
            texture: "",
            count: 10,
            _version: MinecraftVersion.V114,
          },
        },
        cooking: {
          experience: 0,
          time: 0,
        },
        crafting: {
          keepWhitespace: false,
          shapeless: false,
        },
      };

      expect(generate(recipeSlice, MinecraftVersion.V114)).toEqual({
        type: "minecraft:stonecutting",
        ingredient: {
          item: "minecraft:stone",
        },
        result: "minecraft:cobblestone",
        count: 10,
      });
    });
  });

  describe("1.21+ and bedrock", () => {
    it("should generate 1.21 stonecutting with object result", () => {
      const recipeSlice: SingleRecipeState = {
        recipeType: RecipeType.Stonecutter,
        group: "",
        slots: {
          "stonecutter.ingredient": {
            type: "default_item",
            id: { raw: "minecraft:stone", id: "stone", namespace: "minecraft" },
            displayName: "stone",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V121,
          },
          "stonecutter.result": {
            type: "default_item",
            id: { raw: "minecraft:stone_bricks", id: "stone_bricks", namespace: "minecraft" },
            displayName: "stone_bricks",
            texture: "",
            count: 2,
            _version: MinecraftVersion.V121,
          },
        },
        cooking: { experience: 0, time: 0 },
        crafting: { keepWhitespace: false, shapeless: false },
      };

      expect(generate(recipeSlice, MinecraftVersion.V121)).toEqual({
        type: "minecraft:stonecutting",
        ingredient: { item: "minecraft:stone" },
        result: { id: "minecraft:stone_bricks", count: 2 },
      });
    });

    it("should generate bedrock stonecutter shapeless body", () => {
      const recipeSlice: SingleRecipeState = {
        recipeType: RecipeType.Stonecutter,
        group: "",
        slots: {
          "stonecutter.ingredient": {
            type: "default_item",
            id: { raw: "minecraft:stone", id: "stone", namespace: "minecraft" },
            displayName: "stone",
            texture: "",
            count: 1,
            _version: MinecraftVersion.Bedrock,
          },
          "stonecutter.result": {
            type: "default_item",
            id: { raw: "minecraft:stone_bricks", id: "stone_bricks", namespace: "minecraft" },
            displayName: "stone_bricks",
            texture: "",
            count: 1,
            _version: MinecraftVersion.Bedrock,
          },
        },
        cooking: { experience: 0, time: 0 },
        crafting: { keepWhitespace: false, shapeless: false },
      };

      expect(generate(recipeSlice, MinecraftVersion.Bedrock)).toEqual({
        ingredients: [{ item: "minecraft:stone" }],
        result: { item: "minecraft:stone_bricks", count: 1 },
      });
    });
  });
});
