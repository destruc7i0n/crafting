import { RecipeSliceState } from "@/store/slices/recipeSlice";

import { generate } from "./crafting";
import { MinecraftIdentifier } from "../models/identifier/MinecraftIdentifier";
import { MinecraftIdentifierNoNamespace } from "../models/identifier/MinecraftIdentifierNoNamespace";
import { Item as ItemModel } from "../models/item/Item";
import { MinecraftVersion, RecipeType } from "../types";

describe("generate crafting", () => {
  describe("1.12", () => {
    describe("shapeless", () => {
      it("should generate a shapeless recipe", () => {
        const recipeSlice: RecipeSliceState = {
          recipeType: RecipeType.Crafting,
          group: "",
          slots: {
            "crafting.1": new ItemModel(
              MinecraftIdentifierNoNamespace.from("stone:1"),
              "stone",
              1,
            ),
            "crafting.2": new ItemModel(
              MinecraftIdentifierNoNamespace.from("stone:1"),
              "stone",
              1,
            ),
            "crafting.result": new ItemModel(
              MinecraftIdentifierNoNamespace.from("cobblestone"),
              "cobblestone",
              10,
            ),
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
        const recipeSlice: RecipeSliceState = {
          recipeType: RecipeType.Crafting,
          group: "",
          slots: {
            "crafting.1": new ItemModel(
              MinecraftIdentifierNoNamespace.from("stone:1"),
              "stone",
              1,
            ),
            "crafting.2": new ItemModel(
              MinecraftIdentifierNoNamespace.from("stone:1"),
              "stone",
              1,
            ),
            "crafting.4": new ItemModel(
              MinecraftIdentifierNoNamespace.from("stone:1"),
              "stone",
              1,
            ),
            "crafting.5": new ItemModel(
              MinecraftIdentifierNoNamespace.from("stone:1"),
              "stone",
              1,
            ),
            "crafting.7": new ItemModel(
              MinecraftIdentifierNoNamespace.from("stone:1"),
              "stone",
              1,
            ),
            "crafting.8": new ItemModel(
              MinecraftIdentifierNoNamespace.from("stone:1"),
              "stone",
              1,
            ),
            "crafting.result": new ItemModel(
              MinecraftIdentifierNoNamespace.from("cobblestone"),
              "cobblestone",
              10,
            ),
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
        const recipeSlice: RecipeSliceState = {
          recipeType: RecipeType.Crafting,
          group: "",
          slots: {
            "crafting.1": new ItemModel(
              MinecraftIdentifierNoNamespace.from("stone:1"),
              "stone",
              1,
            ),
            "crafting.2": new ItemModel(
              MinecraftIdentifierNoNamespace.from("paper:1"),
              "stone",
              1,
            ),
            "crafting.4": new ItemModel(
              MinecraftIdentifierNoNamespace.from("stone:1"),
              "stone",
              1,
            ),
            "crafting.5": new ItemModel(
              MinecraftIdentifierNoNamespace.from("iron_ingot:1"),
              "stone",
              1,
            ),
            "crafting.7": new ItemModel(
              MinecraftIdentifierNoNamespace.from("stone:1"),
              "stone",
              1,
            ),
            "crafting.8": new ItemModel(
              MinecraftIdentifierNoNamespace.from("stick:1"),
              "stone",
              1,
            ),
            "crafting.result": new ItemModel(
              MinecraftIdentifierNoNamespace.from("cobblestone"),
              "cobblestone",
              10,
            ),
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
        const recipeSlice: RecipeSliceState = {
          recipeType: RecipeType.Crafting,
          group: "",
          slots: {
            "crafting.1": new ItemModel(
              MinecraftIdentifier.from("minecraft:stone"),
              "stone",
              1,
            ),
            "crafting.2": new ItemModel(
              MinecraftIdentifier.from("minecraft:stone"),
              "stone",
              1,
            ),
            "crafting.result": new ItemModel(
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
        const recipeSlice: RecipeSliceState = {
          recipeType: RecipeType.Crafting,
          group: "",
          slots: {
            "crafting.1": new ItemModel(
              MinecraftIdentifier.from("minecraft:stone"),
              "stone",
              1,
            ),
            "crafting.2": new ItemModel(
              MinecraftIdentifier.from("minecraft:stone"),
              "stone",
              1,
            ),
            "crafting.4": new ItemModel(
              MinecraftIdentifier.from("minecraft:stone"),
              "stone",
              1,
            ),
            "crafting.5": new ItemModel(
              MinecraftIdentifier.from("minecraft:stone"),
              "stone",
              1,
            ),
            "crafting.7": new ItemModel(
              MinecraftIdentifier.from("minecraft:stone"),
              "stone",
              1,
            ),
            "crafting.8": new ItemModel(
              MinecraftIdentifier.from("minecraft:stone"),
              "stone",
              1,
            ),
            "crafting.result": new ItemModel(
              MinecraftIdentifier.from("minecraft:cobblestone"),
              "cobblestone",
              10,
            ),
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
        const recipeSlice: RecipeSliceState = {
          recipeType: RecipeType.Crafting,
          group: "",
          slots: {
            "crafting.1": new ItemModel(
              MinecraftIdentifier.from("minecraft:stone"),
              "stone",
              1,
            ),
            "crafting.2": new ItemModel(
              MinecraftIdentifier.from("minecraft:paper"),
              "stone",
              1,
            ),
            "crafting.4": new ItemModel(
              MinecraftIdentifier.from("minecraft:stone"),
              "stone",
              1,
            ),
            "crafting.5": new ItemModel(
              MinecraftIdentifier.from("minecraft:iron_ingot"),
              "stone",
              1,
            ),
            "crafting.7": new ItemModel(
              MinecraftIdentifier.from("minecraft:stone"),
              "stone",
              1,
            ),
            "crafting.8": new ItemModel(
              MinecraftIdentifier.from("minecraft:stick"),
              "stone",
              1,
            ),
            "crafting.result": new ItemModel(
              MinecraftIdentifier.from("minecraft:cobblestone"),
              "cobblestone",
              10,
            ),
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
