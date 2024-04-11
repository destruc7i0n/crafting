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
          "stonecutting.ingredient": {
  id: { raw: "minecraft:stone", id: "", namespace: "minecraft" },
  displayName: "stone",
  count: 1,
},
          "stonecutting.result": {
  id: { raw: "minecraft:cobblestone", id: "", namespace: "minecraft" },
  displayName: "cobblestone",
  count: 10,
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
