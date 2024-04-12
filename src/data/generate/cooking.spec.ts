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
            id: { raw: "minecraft:stone", id: "stone", namespace: "minecraft" },
            displayName: "stone",
            count: 1,
            _version: MinecraftVersion.V113,
          },
          "cooking.result": {
            id: {
              raw: "minecraft:cobblestone",
              id: "cobblestone",
              namespace: "minecraft",
            },
            displayName: "cobblestone",
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
            id: {
              raw: "minecraft:porkchop",
              id: "porkchop",
              namespace: "minecraft",
            },
            displayName: "stone",
            count: 1,
            _version: MinecraftVersion.V114,
          },
          "cooking.result": {
            id: {
              raw: "minecraft:cooked_porkchop",
              id: "cooked_porkchop",
              namespace: "minecraft",
            },
            displayName: "cobblestone",
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
            id: {
              raw: "minecraft:potato",
              id: "potato",
              namespace: "minecraft",
            },
            displayName: "potato",
            count: 1,
            _version: MinecraftVersion.V114,
          },
          "cooking.result": {
            id: {
              raw: "minecraft:baked_potato",
              id: "baked_potato",
              namespace: "minecraft",
            },
            displayName: "baked_potato",
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
            id: { raw: "minecraft:beef", id: "beef", namespace: "minecraft" },
            displayName: "beef",
            count: 1,
            _version: MinecraftVersion.V114,
          },
          "cooking.result": {
            id: {
              raw: "minecraft:cooked_beef",
              id: "cooked_beef",
              namespace: "minecraft",
            },
            displayName: "cooked_beef",
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
            id: {
              raw: "minecraft:iron_ore",
              id: "iron_ore",
              namespace: "minecraft",
            },
            displayName: "iron_ore",
            count: 1,
            _version: MinecraftVersion.V114,
          },
          "cooking.result": {
            id: {
              raw: "minecraft:iron_ingot",
              id: "iron_ingot",
              namespace: "minecraft",
            },
            displayName: "iron_ingot",
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
});
