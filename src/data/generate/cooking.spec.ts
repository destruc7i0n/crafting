import { RecipeSliceState } from "@/store/slices/recipeSlice";

import { generate } from "./cooking";
import { MinecraftIdentifier } from "../models/identifier/MinecraftIdentifier";
import { Item as ItemModel } from "../models/item/Item";
import { MinecraftVersion, RecipeType } from "../types";

describe("generate cooking", () => {
  describe("1.13", () => {
    it("should generate a smelting recipe", () => {
      const recipeSlice: RecipeSliceState = {
        recipeType: RecipeType.Smelting,
        group: "",
        slots: {
          "cooking.ingredient": new ItemModel(
            MinecraftIdentifier.from("minecraft:stone"),
            "stone",
            1,
          ),
          "cooking.result": new ItemModel(
            MinecraftIdentifier.from("minecraft:cobblestone"),
            "cobblestone",
            10,
          ),
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
      const recipeSlice: RecipeSliceState = {
        recipeType: RecipeType.Smelting,
        group: "",
        slots: {
          "cooking.ingredient": new ItemModel(
            MinecraftIdentifier.from("minecraft:porkchop"),
            "stone",
            1,
          ),
          "cooking.result": new ItemModel(
            MinecraftIdentifier.from("minecraft:cooked_porkchop"),
            "cobblestone",
            10,
          ),
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
      const recipeSlice: RecipeSliceState = {
        recipeType: RecipeType.CampfireCooking,
        group: "",
        slots: {
          "cooking.ingredient": new ItemModel(
            MinecraftIdentifier.from("minecraft:potato"),
            "potato",
            1,
          ),
          "cooking.result": new ItemModel(
            MinecraftIdentifier.from("minecraft:baked_potato"),
            "baked_potato",
            10,
          ),
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
      const recipeSlice: RecipeSliceState = {
        recipeType: RecipeType.Smoking,
        group: "",
        slots: {
          "cooking.ingredient": new ItemModel(
            MinecraftIdentifier.from("minecraft:beef"),
            "beef",
            1,
          ),
          "cooking.result": new ItemModel(
            MinecraftIdentifier.from("minecraft:cooked_beef"),
            "cooked_beef",
            10,
          ),
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
      const recipeSlice: RecipeSliceState = {
        recipeType: RecipeType.Blasting,
        group: "",
        slots: {
          "cooking.ingredient": new ItemModel(
            MinecraftIdentifier.from("minecraft:iron_ore"),
            "iron_ore",
            1,
          ),
          "cooking.result": new ItemModel(
            MinecraftIdentifier.from("minecraft:iron_ingot"),
            "iron_ingot",
            10,
          ),
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
