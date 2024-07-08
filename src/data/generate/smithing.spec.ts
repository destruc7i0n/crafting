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
});
