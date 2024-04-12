import { SingleRecipeState } from "@/stores/recipe";

import { generate } from "./crafting";
import { MinecraftVersion, RecipeType } from "../types";

describe("generate crafting", () => {
  describe("1.12", () => {
    describe("shapeless", () => {
      it("should generate a shapeless recipe", () => {
        const recipeSlice: SingleRecipeState = {
          recipeType: RecipeType.Crafting,
          group: "",
          slots: {
            "crafting.1": {
              id: {
                raw: "stone:1",
                id: "stone",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.2": {
              id: {
                raw: "stone:1",
                id: "stone",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.result": {
              id: {
                raw: "cobblestone",
                id: "cobblestone",
                namespace: "minecraft",
              },
              displayName: "cobblestone",
              count: 10,
              _version: MinecraftVersion.V112,
            },
          },
          crafting: {
            shapeless: true,
            keepWhitespace: false,
          },
          cooking: {
            time: 0,
            experience: 0,
          },
        };
        expect(generate(recipeSlice, MinecraftVersion.V112)).toEqual({
          type: "crafting_shapeless",
          ingredients: [
            { item: "stone", data: 1 },
            { item: "stone", data: 1 },
          ],
          result: { item: "cobblestone", count: 10 },
        });
      });
    });

    describe("shaped", () => {
      it("should generate a shaped recipe without keeping whitespace", () => {
        const recipeSlice: SingleRecipeState = {
          recipeType: RecipeType.Crafting,
          group: "",
          slots: {
            "crafting.1": {
              id: {
                raw: "stone:1",
                id: "stone",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.2": {
              id: {
                raw: "stone:1",
                id: "stone",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.4": {
              id: {
                raw: "stone:1",
                id: "stone",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.5": {
              id: {
                raw: "stone:1",
                id: "stone",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.7": {
              id: {
                raw: "stone:1",
                id: "stone",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.8": {
              id: {
                raw: "stone:1",
                id: "stone",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.result": {
              id: {
                raw: "cobblestone",
                id: "cobblestone",
                namespace: "minecraft",
              },
              displayName: "cobblestone",
              count: 10,
              _version: MinecraftVersion.V112,
            },
          },
          crafting: {
            shapeless: false,
            keepWhitespace: false,
          },
          cooking: {
            time: 0,
            experience: 0,
          },
        };
        expect(generate(recipeSlice, MinecraftVersion.V112)).toEqual({
          type: "crafting_shaped",
          pattern: ["##", "##", "##"],
          key: {
            "#": { item: "stone", data: 1 },
          },
          result: { item: "cobblestone", count: 10 },
        });
      });

      it("should generate a shaped recipe keeping whitespace", () => {
        const recipeSlice: SingleRecipeState = {
          recipeType: RecipeType.Crafting,
          group: "",
          slots: {
            "crafting.1": {
              id: {
                raw: "stone:1",
                id: "stone",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.2": {
              id: {
                raw: "paper:1",
                id: "paper",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.4": {
              id: {
                raw: "stone:1",
                id: "stone",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.5": {
              id: {
                raw: "iron_ingot:1",
                id: "iron_ingot",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.7": {
              id: {
                raw: "stone:1",
                id: "stone",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.8": {
              id: {
                raw: "stick:1",
                id: "stick",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.result": {
              id: {
                raw: "cobblestone",
                id: "cobblestone",
                namespace: "minecraft",
              },
              displayName: "cobblestone",
              count: 10,
              _version: MinecraftVersion.V112,
            },
          },
          crafting: {
            shapeless: false,
            keepWhitespace: true,
          },
          cooking: {
            time: 0,
            experience: 0,
          },
        };
        expect(generate(recipeSlice, MinecraftVersion.V112)).toEqual({
          type: "crafting_shaped",
          pattern: ["#P ", "#i ", "#/ "],
          key: {
            "#": { item: "stone", data: 1 },
            P: { item: "paper", data: 1 },
            i: { item: "iron_ingot", data: 1 },
            "/": { item: "stick", data: 1 },
          },
          result: { item: "cobblestone", count: 10 },
        });
      });
    });
  });

  describe("1.14 - 1.20", () => {
    describe("shapeless", () => {
      it("should generate a shapeless recipe", () => {
        const recipeSlice: SingleRecipeState = {
          recipeType: RecipeType.Crafting,
          group: "",
          slots: {
            "crafting.1": {
              id: {
                raw: "minecraft:stone",
                id: "",
                namespace: "minecraft",
              },
              displayName: "stone",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.2": {
              id: {
                raw: "minecraft:stone",
                id: "",
                namespace: "minecraft",
              },
              displayName: "stone",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.result": {
              id: {
                raw: "minecraft:cobblestone",
                id: "",
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
            time: 0,
            experience: 0,
          },
        };
        expect(generate(recipeSlice, MinecraftVersion.V114)).toEqual({
          type: "minecraft:crafting_shapeless",
          ingredients: [
            { item: "minecraft:stone" },
            { item: "minecraft:stone" },
          ],
          result: { item: "minecraft:cobblestone", count: 10 },
        });
      });
    });

    describe("shaped", () => {
      it("should generate a shaped recipe without keeping whitespace", () => {
        const recipeSlice: SingleRecipeState = {
          recipeType: RecipeType.Crafting,
          group: "",
          slots: {
            "crafting.1": {
              id: {
                raw: "minecraft:stone",
                id: "stone",
                namespace: "minecraft",
              },
              displayName: "stone",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.2": {
              id: {
                raw: "minecraft:stone",
                id: "stone",
                namespace: "minecraft",
              },
              displayName: "stone",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.4": {
              id: {
                raw: "minecraft:stone",
                id: "stone",
                namespace: "minecraft",
              },
              displayName: "stone",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.5": {
              id: {
                raw: "minecraft:stone",
                id: "stone",
                namespace: "minecraft",
              },
              displayName: "stone",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.7": {
              id: {
                raw: "minecraft:stone",
                id: "stone",
                namespace: "minecraft",
              },
              displayName: "stone",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.8": {
              id: {
                raw: "minecraft:stone",
                id: "stone",
                namespace: "minecraft",
              },
              displayName: "stone",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.result": {
              id: {
                raw: "minecraft:cobblestone",
                id: "cobblestone",
                namespace: "minecraft",
              },
              displayName: "cobblestone",
              count: 10,
              _version: MinecraftVersion.V114,
            },
          },
          crafting: {
            shapeless: false,
            keepWhitespace: false,
          },
          cooking: {
            time: 0,
            experience: 0,
          },
        };
        expect(generate(recipeSlice, MinecraftVersion.V114)).toEqual({
          type: "minecraft:crafting_shaped",
          pattern: ["##", "##", "##"],
          key: {
            "#": { item: "minecraft:stone" },
          },
          result: { item: "minecraft:cobblestone", count: 10 },
        });
      });

      it("should generate a shaped recipe keeping whitespace", () => {
        const recipeSlice: SingleRecipeState = {
          recipeType: RecipeType.Crafting,
          group: "",
          slots: {
            "crafting.1": {
              id: {
                raw: "minecraft:stone",
                id: "stone",
                namespace: "minecraft",
              },
              displayName: "stone",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.2": {
              id: {
                raw: "minecraft:paper",
                id: "paper",
                namespace: "minecraft",
              },
              displayName: "stone",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.4": {
              id: {
                raw: "minecraft:stone",
                id: "stone",
                namespace: "minecraft",
              },
              displayName: "stone",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.5": {
              id: {
                raw: "minecraft:iron_ingot",
                id: "iron_ingot",
                namespace: "minecraft",
              },
              displayName: "stone",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.7": {
              id: {
                raw: "minecraft:stone",
                id: "stone",
                namespace: "minecraft",
              },
              displayName: "stone",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.8": {
              id: {
                raw: "minecraft:stick",
                id: "stick",
                namespace: "minecraft",
              },
              displayName: "stone",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.result": {
              id: {
                raw: "minecraft:cobblestone",
                id: "cobblestone",
                namespace: "minecraft",
              },
              displayName: "cobblestone",
              count: 10,
              _version: MinecraftVersion.V114,
            },
          },
          crafting: {
            shapeless: false,
            keepWhitespace: true,
          },
          cooking: {
            time: 0,
            experience: 0,
          },
        };
        expect(generate(recipeSlice, MinecraftVersion.V114)).toEqual({
          type: "minecraft:crafting_shaped",
          pattern: ["#P ", "#i ", "#/ "],
          key: {
            "#": { item: "minecraft:stone" },
            P: { item: "minecraft:paper" },
            i: { item: "minecraft:iron_ingot" },
            "/": { item: "minecraft:stick" },
          },
          result: { item: "minecraft:cobblestone", count: 10 },
        });
      });
    });
  });
});
