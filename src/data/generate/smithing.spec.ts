import { RecipeSliceState } from "@/store/slices/recipeSlice";

import { generate } from "./smithing";
import { MinecraftIdentifier } from "../models/identifier/MinecraftIdentifier";
import { Item as ItemModel } from "../models/item/Item";
import { MinecraftVersion, RecipeType } from "../types";

describe("generate stonecutting", () => {
  describe("1.16", () => {
    it("should generate a stonecutting recipe", () => {
      const recipeSlice: RecipeSliceState = {
        recipeType: RecipeType.Smithing,
        group: "",
        slots: {
          "smithing.base": new ItemModel(
            MinecraftIdentifier.from("minecraft:diamond_sword"),
            "diamond_sword",
            1,
          ),
          "smithing.addition": new ItemModel(
            MinecraftIdentifier.from("minecraft:netherite_ingot"),
            "netherite_ingot",
            1,
          ),
          "smithing.result": new ItemModel(
            MinecraftIdentifier.from("minecraft:netherite_sword"),
            "netherite_sword",
            1,
          ),
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
        const recipeSlice: RecipeSliceState = {
          recipeType: RecipeType.SmithingTrim,
          group: "",
          slots: {
            "smithing.template": new ItemModel(
              MinecraftIdentifier.from(
                "minecraft:netherite_upgrade_smithing_template",
              ),
              "netherite_upgrade_smithing_template",
              1,
            ),
            "smithing.base": new ItemModel(
              MinecraftIdentifier.from("minecraft:diamond_sword"),
              "diamond_sword",
              1,
            ),
            "smithing.addition": new ItemModel(
              MinecraftIdentifier.from("minecraft:netherite_ingot"),
              "netherite_ingot",
              1,
            ),
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
        const recipeSlice: RecipeSliceState = {
          recipeType: RecipeType.SmithingTransform,
          group: "",
          slots: {
            "smithing.template": new ItemModel(
              MinecraftIdentifier.from(
                "minecraft:netherite_upgrade_smithing_template",
              ),
              "netherite_upgrade_smithing_template",
              1,
            ),
            "smithing.base": new ItemModel(
              MinecraftIdentifier.from("minecraft:diamond_sword"),
              "diamond_sword",
              1,
            ),
            "smithing.addition": new ItemModel(
              MinecraftIdentifier.from("minecraft:netherite_ingot"),
              "netherite_ingot",
              1,
            ),
            "smithing.result": new ItemModel(
              MinecraftIdentifier.from("minecraft:netherite_sword"),
              "netherite_sword",
              1,
            ),
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
