import { createEmptySlotContext, recipeStateDefaults } from "@/stores/recipe";
import { makeRecipe } from "@/test/recipe-fixtures";

import { MinecraftVersion, RecipeType } from "../types";
import { generate } from "./smithing";

describe("generate smithing", () => {
  describe("1.16", () => {
    it("should generate a smithing recipe", () => {
      const recipeSlice = makeRecipe({
        ...recipeStateDefaults,
        recipeType: RecipeType.Smithing,
        group: "",
        slots: {
          "smithing.base": {
            type: "default_item",
            id: {
              id: "diamond_sword",
              namespace: "minecraft",
            },
            displayName: "diamond_sword",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V116,
          },
          "smithing.addition": {
            type: "default_item",
            id: {
              id: "netherite_ingot",
              namespace: "minecraft",
            },
            displayName: "netherite_ingot",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V116,
          },
          "smithing.result": {
            type: "default_item",
            id: {
              id: "netherite_sword",
              namespace: "minecraft",
            },
            displayName: "netherite_sword",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V116,
          },
        },
        cooking: {
          experience: 0,
          time: 0,
        },
        crafting: {
          ...recipeStateDefaults.crafting,
          keepWhitespace: false,
          shapeless: false,
        },
      });

      expect(generate(recipeSlice, MinecraftVersion.V116)).toEqual({
        type: "minecraft:smithing",
        base: {
          item: "minecraft:diamond_sword",
        },
        addition: {
          item: "minecraft:netherite_ingot",
        },
        result: {
          item: "minecraft:netherite_sword",
        },
      });
    });
  });

  describe("1.19", () => {
    describe("smithing trim", () => {
      it("should generate a smithing trim recipe", () => {
        const recipeSlice = makeRecipe({
          ...recipeStateDefaults,
          recipeType: RecipeType.SmithingTrim,
          group: "",
          slots: {
            "smithing.template": {
              type: "default_item",
              id: {
                id: "netherite_upgrade_smithing_template",
                namespace: "minecraft",
              },
              displayName: "netherite_upgrade_smithing_template",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V119,
            },
            "smithing.base": {
              type: "default_item",
              id: {
                id: "diamond_sword",
                namespace: "minecraft",
              },
              displayName: "diamond_sword",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V119,
            },
            "smithing.addition": {
              type: "default_item",
              id: {
                id: "netherite_ingot",
                namespace: "minecraft",
              },
              displayName: "netherite_ingot",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V119,
            },
          },
          cooking: {
            experience: 0,
            time: 0,
          },
          crafting: {
            ...recipeStateDefaults.crafting,
            keepWhitespace: false,
            shapeless: false,
          },
        });

        expect(generate(recipeSlice, MinecraftVersion.V119)).toEqual({
          type: "minecraft:smithing_trim",
          template: {
            item: "minecraft:netherite_upgrade_smithing_template",
          },
          base: {
            item: "minecraft:diamond_sword",
          },
          addition: {
            item: "minecraft:netherite_ingot",
          },
        });
      });
    });

    describe("smithing transform", () => {
      it("should generate a smithing transform recipe", () => {
        const recipeSlice = makeRecipe({
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
              displayName: "netherite_upgrade_smithing_template",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V119,
            },
            "smithing.base": {
              type: "default_item",
              id: {
                id: "diamond_sword",
                namespace: "minecraft",
              },
              displayName: "diamond_sword",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V119,
            },
            "smithing.addition": {
              type: "default_item",
              id: {
                id: "netherite_ingot",
                namespace: "minecraft",
              },
              displayName: "netherite_ingot",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V119,
            },
            "smithing.result": {
              type: "default_item",
              id: {
                id: "netherite_sword",
                namespace: "minecraft",
              },
              displayName: "netherite_sword",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V119,
            },
          },
          cooking: {
            experience: 0,
            time: 0,
          },
          crafting: {
            ...recipeStateDefaults.crafting,
            keepWhitespace: false,
            shapeless: false,
          },
        });

        expect(generate(recipeSlice, MinecraftVersion.V119)).toEqual({
          type: "minecraft:smithing_transform",
          template: {
            item: "minecraft:netherite_upgrade_smithing_template",
          },
          base: {
            item: "minecraft:diamond_sword",
          },
          addition: {
            item: "minecraft:netherite_ingot",
          },
          result: {
            item: "minecraft:netherite_sword",
          },
        });
      });
    });
  });

  describe("1.21.5", () => {
    it("should generate a smithing trim recipe with a pattern", () => {
      const recipeSlice = makeRecipe({
        ...recipeStateDefaults,
        recipeType: RecipeType.SmithingTrim,
        group: "",
        smithingTrimPattern: "minecraft:bolt",
        slots: {
          "smithing.template": {
            type: "default_item",
            id: {
              id: "bolt_armor_trim_smithing_template",
              namespace: "minecraft",
            },
            displayName: "bolt_armor_trim_smithing_template",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V1215,
          },
          "smithing.base": {
            type: "tag_item",
            id: {
              id: "trimmable_armor",
              namespace: "minecraft",
            },
            displayName: "#minecraft:trimmable_armor",
            texture: "",
            _version: MinecraftVersion.V1215,
            tagSource: "vanilla",
            values: [],
          },
          "smithing.addition": {
            type: "tag_item",
            id: {
              id: "trim_materials",
              namespace: "minecraft",
            },
            displayName: "#minecraft:trim_materials",
            texture: "",
            _version: MinecraftVersion.V1215,
            tagSource: "vanilla",
            values: [],
          },
        },
        cooking: {
          experience: 0,
          time: 0,
        },
        crafting: {
          ...recipeStateDefaults.crafting,
          keepWhitespace: false,
          shapeless: false,
        },
      });

      expect(generate(recipeSlice, MinecraftVersion.V1215)).toEqual({
        type: "minecraft:smithing_trim",
        template: "minecraft:bolt_armor_trim_smithing_template",
        base: "#minecraft:trimmable_armor",
        addition: "#minecraft:trim_materials",
        pattern: "minecraft:bolt",
      });
    });
  });

  describe("bedrock", () => {
    it("should generate bedrock smithing trim body with tags", () => {
      const recipeSlice = makeRecipe({
        ...recipeStateDefaults,
        recipeType: RecipeType.SmithingTrim,
        group: "",
        slots: {
          "smithing.template": {
            type: "tag_item",
            id: { id: "trim_templates", namespace: "minecraft" },
            displayName: "#minecraft:trim_templates",
            texture: "",
            _version: MinecraftVersion.Bedrock,
            tagSource: "vanilla",
            values: [],
          },
          "smithing.base": {
            type: "tag_item",
            id: { id: "trimmable_armors", namespace: "minecraft" },
            displayName: "#minecraft:trimmable_armors",
            texture: "",
            _version: MinecraftVersion.Bedrock,
            tagSource: "vanilla",
            values: [],
          },
          "smithing.addition": {
            type: "tag_item",
            id: { id: "trim_materials", namespace: "minecraft" },
            displayName: "#minecraft:trim_materials",
            texture: "",
            _version: MinecraftVersion.Bedrock,
            tagSource: "vanilla",
            values: [],
          },
        },
        cooking: { experience: 0, time: 0 },
        crafting: { ...recipeStateDefaults.crafting, keepWhitespace: false, shapeless: false },
      });

      expect(generate(recipeSlice, MinecraftVersion.Bedrock)).toEqual({
        template: { tag: "minecraft:trim_templates" },
        base: { tag: "minecraft:trimmable_armors" },
        addition: { tag: "minecraft:trim_materials" },
      });
    });

    it("should generate bedrock smithing trim body with regular items", () => {
      const recipeSlice = makeRecipe({
        ...recipeStateDefaults,
        recipeType: RecipeType.SmithingTrim,
        group: "",
        slots: {
          "smithing.template": {
            type: "default_item",
            id: { id: "netherite_upgrade_smithing_template", namespace: "minecraft" },
            displayName: "netherite_upgrade_smithing_template",
            texture: "",
            count: 1,
            _version: MinecraftVersion.Bedrock,
          },
          "smithing.base": {
            type: "default_item",
            id: { id: "diamond_boots", namespace: "minecraft" },
            displayName: "diamond_boots",
            texture: "",
            count: 1,
            _version: MinecraftVersion.Bedrock,
          },
          "smithing.addition": {
            type: "default_item",
            id: { id: "quartz", namespace: "minecraft" },
            displayName: "quartz",
            texture: "",
            count: 1,
            _version: MinecraftVersion.Bedrock,
          },
        },
        cooking: { experience: 0, time: 0 },
        crafting: { ...recipeStateDefaults.crafting, keepWhitespace: false, shapeless: false },
      });

      expect(generate(recipeSlice, MinecraftVersion.Bedrock)).toEqual({
        template: { item: "minecraft:netherite_upgrade_smithing_template" },
        base: { item: "minecraft:diamond_boots" },
        addition: { item: "minecraft:quartz" },
      });
    });

    it("should generate bedrock legacy smithing body", () => {
      const recipeSlice = makeRecipe({
        ...recipeStateDefaults,
        recipeType: RecipeType.Smithing,
        group: "",
        slots: {
          "smithing.base": {
            type: "default_item",
            id: { id: "diamond_sword", namespace: "minecraft" },
            displayName: "diamond_sword",
            texture: "",
            count: 1,
            _version: MinecraftVersion.Bedrock,
          },
          "smithing.addition": {
            type: "default_item",
            id: { id: "netherite_ingot", namespace: "minecraft" },
            displayName: "netherite_ingot",
            texture: "",
            count: 1,
            _version: MinecraftVersion.Bedrock,
          },
          "smithing.result": {
            type: "default_item",
            id: { id: "netherite_sword", namespace: "minecraft" },
            displayName: "netherite_sword",
            texture: "",
            count: 1,
            _version: MinecraftVersion.Bedrock,
          },
        },
        cooking: { experience: 0, time: 0 },
        crafting: { ...recipeStateDefaults.crafting, keepWhitespace: false, shapeless: false },
      });

      expect(generate(recipeSlice, MinecraftVersion.Bedrock)).toEqual({
        ingredients: [{ item: "minecraft:diamond_sword" }, { item: "minecraft:netherite_ingot" }],
        result: { item: "minecraft:netherite_sword", count: 1 },
      });
    });
  });

  it("throws when a placed custom result ref cannot be resolved", () => {
    const recipeSlice = makeRecipe({
      recipeType: RecipeType.Smithing,
      slots: {
        "smithing.base": {
          type: "default_item",
          id: { id: "diamond_sword", namespace: "minecraft" },
          displayName: "diamond_sword",
          texture: "",
          _version: MinecraftVersion.V121,
        },
        "smithing.addition": {
          type: "default_item",
          id: { id: "netherite_ingot", namespace: "minecraft" },
          displayName: "netherite_ingot",
          texture: "",
          _version: MinecraftVersion.V121,
        },
        "smithing.result": { kind: "custom_item", uid: "missing-result" },
      },
    });

    expect(() =>
      generate(recipeSlice, MinecraftVersion.V121, createEmptySlotContext(MinecraftVersion.V121)),
    ).toThrow("Cannot generate output for unresolved custom_item reference");
  });
});
