import { SingleRecipeState } from "@/stores/recipe";

import { generate } from "./smithing";
import { MinecraftVersion, RecipeType } from "../types";

describe("generate smithing", () => {
  describe("1.16", () => {
    it("should generate a smithing recipe", () => {
      const recipeSlice: SingleRecipeState = {
        recipeType: RecipeType.Smithing,
        group: "",
        slots: {
          "smithing.base": {
            type: "default_item",
            id: {
              raw: "minecraft:diamond_sword",
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
              raw: "minecraft:netherite_ingot",
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
              raw: "minecraft:netherite_sword",
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
          keepWhitespace: false,
          shapeless: false,
        },
      };

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
        const recipeSlice: SingleRecipeState = {
          recipeType: RecipeType.SmithingTrim,
          group: "",
          slots: {
            "smithing.template": {
              type: "default_item",
              id: {
                raw: "minecraft:netherite_upgrade_smithing_template",
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
                raw: "minecraft:diamond_sword",
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
                raw: "minecraft:netherite_ingot",
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
            keepWhitespace: false,
            shapeless: false,
          },
        };

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
        const recipeSlice: SingleRecipeState = {
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
              displayName: "netherite_upgrade_smithing_template",
              texture: "",
              count: 1,
              _version: MinecraftVersion.V119,
            },
            "smithing.base": {
              type: "default_item",
              id: {
                raw: "minecraft:diamond_sword",
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
                raw: "minecraft:netherite_ingot",
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
                raw: "minecraft:netherite_sword",
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
            keepWhitespace: false,
            shapeless: false,
          },
        };

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
      const recipeSlice: SingleRecipeState = {
        recipeType: RecipeType.SmithingTrim,
        group: "",
        smithingTrimPattern: "minecraft:bolt",
        slots: {
          "smithing.template": {
            type: "default_item",
            id: {
              raw: "minecraft:bolt_armor_trim_smithing_template",
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
              raw: "minecraft:trimmable_armor",
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
              raw: "minecraft:trim_materials",
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
          keepWhitespace: false,
          shapeless: false,
        },
      };

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
    it("should generate bedrock smithing trim body", () => {
      const recipeSlice: SingleRecipeState = {
        recipeType: RecipeType.SmithingTrim,
        group: "",
        slots: {
          "smithing.template": {
            type: "default_item",
            id: { raw: "minecraft:trim_templates", id: "trim_templates", namespace: "minecraft" },
            displayName: "trim_templates",
            texture: "",
            count: 1,
            _version: MinecraftVersion.Bedrock,
          },
          "smithing.base": {
            type: "default_item",
            id: {
              raw: "minecraft:trimmable_armors",
              id: "trimmable_armors",
              namespace: "minecraft",
            },
            displayName: "trimmable_armors",
            texture: "",
            count: 1,
            _version: MinecraftVersion.Bedrock,
          },
          "smithing.addition": {
            type: "default_item",
            id: { raw: "minecraft:trim_materials", id: "trim_materials", namespace: "minecraft" },
            displayName: "trim_materials",
            texture: "",
            count: 1,
            _version: MinecraftVersion.Bedrock,
          },
        },
        cooking: { experience: 0, time: 0 },
        crafting: { keepWhitespace: false, shapeless: false },
      };

      expect(generate(recipeSlice, MinecraftVersion.Bedrock)).toEqual({
        template: { tag: "minecraft:trim_templates" },
        base: { tag: "minecraft:trimmable_armors" },
        addition: { tag: "minecraft:trim_materials" },
      });
    });

    it("should generate bedrock legacy smithing body", () => {
      const recipeSlice: SingleRecipeState = {
        recipeType: RecipeType.Smithing,
        group: "",
        slots: {
          "smithing.base": {
            type: "default_item",
            id: { raw: "minecraft:diamond_sword", id: "diamond_sword", namespace: "minecraft" },
            displayName: "diamond_sword",
            texture: "",
            count: 1,
            _version: MinecraftVersion.Bedrock,
          },
          "smithing.addition": {
            type: "default_item",
            id: { raw: "minecraft:netherite_ingot", id: "netherite_ingot", namespace: "minecraft" },
            displayName: "netherite_ingot",
            texture: "",
            count: 1,
            _version: MinecraftVersion.Bedrock,
          },
          "smithing.result": {
            type: "default_item",
            id: { raw: "minecraft:netherite_sword", id: "netherite_sword", namespace: "minecraft" },
            displayName: "netherite_sword",
            texture: "",
            count: 1,
            _version: MinecraftVersion.Bedrock,
          },
        },
        cooking: { experience: 0, time: 0 },
        crafting: { keepWhitespace: false, shapeless: false },
      };

      expect(generate(recipeSlice, MinecraftVersion.Bedrock)).toEqual({
        ingredients: [{ item: "minecraft:diamond_sword" }, { item: "minecraft:netherite_ingot" }],
        result: { item: "minecraft:netherite_sword", count: 1 },
      });
    });
  });
});
