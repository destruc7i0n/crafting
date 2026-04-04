import { createEmptySlotContext, recipeStateDefaults } from "@/stores/recipe";
import { makeRecipe } from "@/test/recipe-fixtures";

import { MinecraftVersion, RecipeType } from "../types";
import { generate } from "./crafting";

const makeDefaultItem = (id: string, version: MinecraftVersion) => ({
  type: "default_item" as const,
  id: { id, namespace: "minecraft" },
  displayName: id,
  texture: "",
  _version: version,
});

const makeTagItem = (id: string, version: MinecraftVersion) => ({
  type: "tag_item" as const,
  id: { id, namespace: "minecraft" },
  displayName: id,
  texture: "",
  _version: version,
  tagSource: "vanilla" as const,
  values: [],
});

const makeShapedRecipeSlice = (
  version: MinecraftVersion,
  slots: Record<string, ReturnType<typeof makeDefaultItem> | ReturnType<typeof makeTagItem>>,
) =>
  makeRecipe({
    recipeType: RecipeType.Crafting,
    group: "",
    slots: {
      ...slots,
      "crafting.result": makeDefaultItem("cobblestone", version),
    },
    crafting: {
      ...recipeStateDefaults.crafting,
      shapeless: false,
      keepWhitespace: false,
    },
    cooking: {
      time: 0,
      experience: 0,
    },
  });

describe("generate crafting", () => {
  describe("1.12", () => {
    describe("shapeless", () => {
      it("should generate a shapeless recipe", () => {
        const recipeSlice = makeRecipe({
          ...recipeStateDefaults,
          recipeType: RecipeType.Crafting,
          group: "",
          slots: {
            "crafting.1": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.2": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.result": {
              type: "default_item",
              id: {
                id: "cobblestone",
                namespace: "minecraft",
              },
              displayName: "cobblestone",
              texture: "",
              count: 10,
              _version: MinecraftVersion.V112,
            },
          },
          crafting: {
            ...recipeStateDefaults.crafting,
            shapeless: true,
            keepWhitespace: false,
          },
          cooking: {
            time: 0,
            experience: 0,
          },
        });
        expect(generate(recipeSlice, MinecraftVersion.V112)).toEqual({
          type: "crafting_shapeless",
          ingredients: [
            { item: "minecraft:stone", data: 1 },
            { item: "minecraft:stone", data: 1 },
          ],
          result: { item: "minecraft:cobblestone", count: 10 },
        });
      });
    });

    describe("shaped", () => {
      it("should generate a shaped recipe without keeping whitespace", () => {
        const recipeSlice = makeRecipe({
          ...recipeStateDefaults,
          recipeType: RecipeType.Crafting,
          group: "",
          slots: {
            "crafting.1": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.2": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.4": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.5": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.7": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.8": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.result": {
              type: "default_item",
              id: {
                id: "cobblestone",
                namespace: "minecraft",
              },
              displayName: "cobblestone",
              texture: "",
              count: 10,
              _version: MinecraftVersion.V112,
            },
          },
          crafting: {
            ...recipeStateDefaults.crafting,
            shapeless: false,
            keepWhitespace: false,
          },
          cooking: {
            time: 0,
            experience: 0,
          },
        });
        expect(generate(recipeSlice, MinecraftVersion.V112)).toEqual({
          type: "crafting_shaped",
          pattern: ["##", "##", "##"],
          key: {
            "#": { item: "minecraft:stone", data: 1 },
          },
          result: { item: "minecraft:cobblestone", count: 10 },
        });
      });

      it("should generate a shaped recipe keeping whitespace", () => {
        const recipeSlice = makeRecipe({
          ...recipeStateDefaults,
          recipeType: RecipeType.Crafting,
          group: "",
          slots: {
            "crafting.1": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.2": {
              type: "default_item",
              id: {
                id: "paper",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.4": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.5": {
              type: "default_item",
              id: {
                id: "iron_ingot",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.7": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.8": {
              type: "default_item",
              id: {
                id: "stick",
                namespace: "minecraft",
                data: 1,
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V112,
            },
            "crafting.result": {
              type: "default_item",
              id: {
                id: "cobblestone",
                namespace: "minecraft",
              },
              displayName: "cobblestone",
              texture: "",
              count: 10,
              _version: MinecraftVersion.V112,
            },
          },
          crafting: {
            ...recipeStateDefaults.crafting,
            shapeless: false,
            keepWhitespace: true,
          },
          cooking: {
            time: 0,
            experience: 0,
          },
        });
        expect(generate(recipeSlice, MinecraftVersion.V112)).toEqual({
          type: "crafting_shaped",
          pattern: ["#_ ", "#= ", "#/ "],
          key: {
            "#": { item: "minecraft:stone", data: 1 },
            _: { item: "minecraft:paper", data: 1 },
            "=": { item: "minecraft:iron_ingot", data: 1 },
            "/": { item: "minecraft:stick", data: 1 },
          },
          result: { item: "minecraft:cobblestone", count: 10 },
        });
      });
    });
  });

  describe("1.14 - 1.20", () => {
    describe("shapeless", () => {
      it("should generate a shapeless recipe", () => {
        const recipeSlice = makeRecipe({
          ...recipeStateDefaults,
          recipeType: RecipeType.Crafting,
          group: "",
          slots: {
            "crafting.1": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.2": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.result": {
              type: "default_item",
              id: {
                id: "cobblestone",
                namespace: "minecraft",
              },
              displayName: "cobblestone",
              texture: "",
              count: 10,
              _version: MinecraftVersion.V114,
            },
          },
          crafting: {
            ...recipeStateDefaults.crafting,
            shapeless: true,
            keepWhitespace: false,
          },
          cooking: {
            time: 0,
            experience: 0,
          },
        });
        expect(generate(recipeSlice, MinecraftVersion.V114)).toEqual({
          type: "minecraft:crafting_shapeless",
          ingredients: [{ item: "minecraft:stone" }, { item: "minecraft:stone" }],
          result: { item: "minecraft:cobblestone", count: 10 },
        });
      });
    });

    describe("shaped", () => {
      it("should generate a shaped recipe without keeping whitespace", () => {
        const recipeSlice = makeRecipe({
          ...recipeStateDefaults,
          recipeType: RecipeType.Crafting,
          group: "",
          slots: {
            "crafting.1": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.2": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.4": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.5": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.7": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.8": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.result": {
              type: "default_item",
              id: {
                id: "cobblestone",
                namespace: "minecraft",
              },
              displayName: "cobblestone",
              texture: "",
              count: 10,
              _version: MinecraftVersion.V114,
            },
          },
          crafting: {
            ...recipeStateDefaults.crafting,
            shapeless: false,
            keepWhitespace: false,
          },
          cooking: {
            time: 0,
            experience: 0,
          },
        });
        expect(generate(recipeSlice, MinecraftVersion.V114)).toEqual({
          type: "minecraft:crafting_shaped",
          pattern: ["##", "##", "##"],
          key: {
            "#": { item: "minecraft:stone" },
          },
          result: { item: "minecraft:cobblestone", count: 10 },
        });
      });

      it("should preserve internal offsets when trimming whitespace", () => {
        const recipeSlice = makeRecipe({
          ...recipeStateDefaults,
          recipeType: RecipeType.Crafting,
          group: "",
          slots: {
            "crafting.2": {
              type: "default_item",
              id: {
                id: "birch_wood",
                namespace: "minecraft",
              },
              displayName: "birch_wood",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.5": {
              type: "default_item",
              id: {
                id: "birch_wood",
                namespace: "minecraft",
              },
              displayName: "birch_wood",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.9": {
              type: "default_item",
              id: {
                id: "smooth_stone_slab",
                namespace: "minecraft",
              },
              displayName: "smooth_stone_slab",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.result": {
              type: "default_item",
              id: {
                id: "cobblestone",
                namespace: "minecraft",
              },
              displayName: "cobblestone",
              texture: "",
              count: 10,
              _version: MinecraftVersion.V114,
            },
          },
          crafting: {
            ...recipeStateDefaults.crafting,
            shapeless: false,
            keepWhitespace: false,
          },
          cooking: {
            time: 0,
            experience: 0,
          },
        });

        expect(generate(recipeSlice, MinecraftVersion.V114)).toEqual({
          type: "minecraft:crafting_shaped",
          pattern: ["# ", "# ", " _"],
          key: {
            "#": { item: "minecraft:birch_wood" },
            _: { item: "minecraft:smooth_stone_slab" },
          },
          result: { item: "minecraft:cobblestone", count: 10 },
        });
      });

      it("should generate a shaped recipe keeping whitespace", () => {
        const recipeSlice = makeRecipe({
          ...recipeStateDefaults,
          recipeType: RecipeType.Crafting,
          group: "",
          slots: {
            "crafting.1": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.2": {
              type: "default_item",
              id: {
                id: "paper",
                namespace: "minecraft",
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.4": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.5": {
              type: "default_item",
              id: {
                id: "iron_ingot",
                namespace: "minecraft",
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.7": {
              type: "default_item",
              id: {
                id: "stone",
                namespace: "minecraft",
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.8": {
              type: "default_item",
              id: {
                id: "stick",
                namespace: "minecraft",
              },
              displayName: "stone",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V114,
            },
            "crafting.result": {
              type: "default_item",
              id: {
                id: "cobblestone",
                namespace: "minecraft",
              },
              displayName: "cobblestone",
              texture: "",
              count: 10,
              _version: MinecraftVersion.V114,
            },
          },
          crafting: {
            ...recipeStateDefaults.crafting,
            shapeless: false,
            keepWhitespace: true,
          },
          cooking: {
            time: 0,
            experience: 0,
          },
        });
        expect(generate(recipeSlice, MinecraftVersion.V114)).toEqual({
          type: "minecraft:crafting_shaped",
          pattern: ["#_ ", "#= ", "#/ "],
          key: {
            "#": { item: "minecraft:stone" },
            _: { item: "minecraft:paper" },
            "=": { item: "minecraft:iron_ingot" },
            "/": { item: "minecraft:stick" },
          },
          result: { item: "minecraft:cobblestone", count: 10 },
        });
      });

      it.each([
        ["stick", "/"],
        ["arrow", "/"],
        ["smooth_stone_slab", "_"],
        ["paper", "_"],
        ["iron_ingot", "="],
        ["gold_nugget", "."],
        ["redstone", "."],
        ["diamond", "o"],
        ["ender_pearl", "o"],
        ["dragon_egg", "o"],
        ["string", "~"],
        ["bow", ")"],
        ["bucket", "u"],
        ["glass_bottle", "u"],
      ])("should use %s as %s in generic dinnerbone mappings", (itemId, keyName) => {
        const recipeSlice = makeShapedRecipeSlice(MinecraftVersion.V114, {
          "crafting.1": makeDefaultItem("stone", MinecraftVersion.V114),
          "crafting.2": makeDefaultItem(itemId, MinecraftVersion.V114),
        });

        expect(generate(recipeSlice, MinecraftVersion.V114)).toEqual({
          type: "minecraft:crafting_shaped",
          pattern: [`#${keyName}`],
          key: {
            "#": { item: "minecraft:stone" },
            [keyName]: { item: `minecraft:${itemId}` },
          },
          result: { item: "minecraft:cobblestone" },
        });
      });

      it("should fall back to normal key selection when dinnerbone mappings collide", () => {
        const recipeSlice = makeShapedRecipeSlice(MinecraftVersion.V114, {
          "crafting.1": makeDefaultItem("stone", MinecraftVersion.V114),
          "crafting.2": makeDefaultItem("stick", MinecraftVersion.V114),
          "crafting.3": makeDefaultItem("arrow", MinecraftVersion.V114),
        });

        expect(generate(recipeSlice, MinecraftVersion.V114)).toEqual({
          type: "minecraft:crafting_shaped",
          pattern: ["#/A"],
          key: {
            "#": { item: "minecraft:stone" },
            "/": { item: "minecraft:stick" },
            A: { item: "minecraft:arrow" },
          },
          result: { item: "minecraft:cobblestone" },
        });
      });

      it("should ignore dinnerbone mappings for tag items", () => {
        const recipeSlice = makeShapedRecipeSlice(MinecraftVersion.V114, {
          "crafting.1": makeDefaultItem("stone", MinecraftVersion.V114),
          "crafting.2": makeTagItem("logs", MinecraftVersion.V114),
        });

        expect(generate(recipeSlice, MinecraftVersion.V114)).toEqual({
          type: "minecraft:crafting_shaped",
          pattern: ["#L"],
          key: {
            "#": { item: "minecraft:stone" },
            L: { tag: "minecraft:logs" },
          },
          result: { item: "minecraft:cobblestone" },
        });
      });
    });
  });

  describe("1.21+ and bedrock", () => {
    it("should generate 1.21 shapeless recipe with id result", () => {
      const recipeSlice = makeRecipe({
        ...recipeStateDefaults,
        recipeType: RecipeType.Crafting,
        group: "",
        slots: {
          "crafting.1": {
            type: "default_item",
            id: { id: "stone", namespace: "minecraft" },
            displayName: "stone",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V121,
          },
          "crafting.result": {
            type: "default_item",
            id: { id: "stone_button", namespace: "minecraft" },
            displayName: "stone_button",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V121,
          },
        },
        crafting: { ...recipeStateDefaults.crafting, shapeless: true, keepWhitespace: false },
        cooking: { time: 0, experience: 0 },
        category: "misc",
      });

      expect(generate(recipeSlice, MinecraftVersion.V121)).toEqual({
        type: "minecraft:crafting_shapeless",
        category: "misc",
        ingredients: [{ item: "minecraft:stone" }],
        result: { id: "minecraft:stone_button", count: 1 },
      });
    });

    it("should generate bedrock shaped recipe body", () => {
      const recipeSlice = makeRecipe({
        ...recipeStateDefaults,
        recipeType: RecipeType.Crafting,
        group: "",
        slots: {
          "crafting.1": {
            type: "default_item",
            id: { id: "planks", namespace: "minecraft" },
            displayName: "planks",
            texture: "",
            count: 1,
            _version: MinecraftVersion.Bedrock,
          },
          "crafting.2": {
            type: "default_item",
            id: { id: "planks", namespace: "minecraft" },
            displayName: "planks",
            texture: "",
            count: 1,
            _version: MinecraftVersion.Bedrock,
          },
          "crafting.result": {
            type: "default_item",
            id: { id: "stick", namespace: "minecraft" },
            displayName: "stick",
            texture: "",
            count: 4,
            _version: MinecraftVersion.Bedrock,
          },
        },
        crafting: { ...recipeStateDefaults.crafting, shapeless: false, keepWhitespace: false },
        cooking: { time: 0, experience: 0 },
      });

      expect(generate(recipeSlice, MinecraftVersion.Bedrock)).toEqual({
        pattern: ["##"],
        key: { "#": { item: "minecraft:planks" } },
        result: { item: "minecraft:stick", count: 4 },
      });
    });

    it("should emit category and show_notification for supported shaped recipes", () => {
      const recipeSlice = makeRecipe({
        ...recipeStateDefaults,
        recipeType: RecipeType.Crafting,
        group: "",
        category: "building",
        showNotification: false,
        slots: {
          "crafting.1": {
            type: "default_item",
            id: { id: "stone", namespace: "minecraft" },
            displayName: "stone",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V120,
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
            _version: MinecraftVersion.V120,
          },
        },
        crafting: { ...recipeStateDefaults.crafting, shapeless: false, keepWhitespace: false },
        cooking: { time: 0, experience: 0 },
      });

      expect(generate(recipeSlice, MinecraftVersion.V120)).toEqual({
        type: "minecraft:crafting_shaped",
        category: "building",
        show_notification: false,
        pattern: ["#"],
        key: { "#": { item: "minecraft:stone" } },
        result: { item: "minecraft:stone_button", count: 1 },
      });
    });

    it("should emit show_notification for shaped recipes on 1.19", () => {
      const recipeSlice = makeRecipe({
        ...recipeStateDefaults,
        recipeType: RecipeType.Crafting,
        group: "",
        showNotification: false,
        slots: {
          "crafting.1": {
            type: "default_item",
            id: { id: "stone", namespace: "minecraft" },
            displayName: "stone",
            texture: "",
            _version: MinecraftVersion.V119,
          },
          "crafting.result": {
            type: "default_item",
            id: { id: "stone_button", namespace: "minecraft" },
            displayName: "stone_button",
            texture: "",
            _version: MinecraftVersion.V119,
          },
        },
        crafting: { ...recipeStateDefaults.crafting, shapeless: false, keepWhitespace: false },
        cooking: { time: 0, experience: 0 },
      });

      expect(generate(recipeSlice, MinecraftVersion.V119)).toMatchObject({
        show_notification: false,
      });
    });

    it("should emit show_notification for shapeless recipes on 26.1", () => {
      const recipeSlice = makeRecipe({
        ...recipeStateDefaults,
        recipeType: RecipeType.Crafting,
        group: "",
        showNotification: false,
        slots: {
          "crafting.1": {
            type: "default_item",
            id: { id: "stone", namespace: "minecraft" },
            displayName: "stone",
            texture: "",
            _version: MinecraftVersion.V261,
          },
          "crafting.result": {
            type: "default_item",
            id: { id: "stone_button", namespace: "minecraft" },
            displayName: "stone_button",
            texture: "",
            _version: MinecraftVersion.V261,
          },
        },
        crafting: { ...recipeStateDefaults.crafting, shapeless: true, keepWhitespace: false },
        cooking: { time: 0, experience: 0 },
      });

      expect(generate(recipeSlice, MinecraftVersion.V261)).toMatchObject({
        type: "minecraft:crafting_shapeless",
        show_notification: false,
      });
    });

    it("should not emit show_notification for shapeless recipes before 26.1", () => {
      const recipeSlice = makeRecipe({
        ...recipeStateDefaults,
        recipeType: RecipeType.Crafting,
        group: "",
        showNotification: false,
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
            id: { id: "stone_button", namespace: "minecraft" },
            displayName: "stone_button",
            texture: "",
            _version: MinecraftVersion.V121,
          },
        },
        crafting: { ...recipeStateDefaults.crafting, shapeless: true, keepWhitespace: false },
        cooking: { time: 0, experience: 0 },
      });

      const result = generate(recipeSlice, MinecraftVersion.V121);
      expect(result).not.toHaveProperty("show_notification");
    });
  });

  it("throws when a placed custom result ref cannot be resolved", () => {
    const recipeSlice = makeRecipe({
      recipeType: RecipeType.Crafting,
      slots: {
        "crafting.1": makeDefaultItem("stone", MinecraftVersion.V121),
        "crafting.result": { kind: "custom_item", uid: "missing-result" },
      },
      crafting: {
        ...recipeStateDefaults.crafting,
        shapeless: true,
        keepWhitespace: false,
      },
    });

    expect(() =>
      generate(recipeSlice, MinecraftVersion.V121, createEmptySlotContext(MinecraftVersion.V121)),
    ).toThrow("Cannot generate output for unresolved custom_item reference");
  });
});
