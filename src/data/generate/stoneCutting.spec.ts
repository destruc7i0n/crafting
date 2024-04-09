import { RecipeSliceState } from "@/store/slices/recipeSlice";

import { generate } from "./stoneCutting";
import { MinecraftIdentifier } from "../models/identifier/MinecraftIdentifier";
import { Item as ItemModel } from "../models/item/Item";
import { MinecraftVersion, RecipeType } from "../types";

describe("generate stonecutting", () => {
  describe("1.14", () => {
    it("should generate a stonecutting recipe", () => {
      const recipeSlice: RecipeSliceState = {
        recipeType: RecipeType.StoneCutting,
        group: "",
        slots: {
          "stonecutting.ingredient": new ItemModel(
            MinecraftIdentifier.from("minecraft:stone"),
            "stone",
            1,
          ),
          "stonecutting.result": new ItemModel(
            MinecraftIdentifier.from("minecraft:cobblestone"),
            "cobblestone",
            10,
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
        type: "minecraft:stonecutting",
        ingredient: {
          item: "minecraft:stone",
        },
        result: "minecraft:cobblestone",
        count: 10,
      });
    });
  });
});
