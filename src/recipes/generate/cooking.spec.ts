import { MinecraftVersion, RecipeType } from "@/data/types";
import { createEmptySlotContext } from "@/stores/recipe/slot-value";
import { recipeStateDefaults } from "@/stores/recipe/types";
import { makeRecipe } from "@/test/recipe-fixtures";

import { buildBedrock, buildJava, extractCookingInput } from "./cooking";
import { createRecipeFormatter } from "./format/recipe-formatter";

type TestRecipe = ReturnType<typeof makeRecipe>;

const buildJavaRecipe = (
  recipe: TestRecipe,
  version: MinecraftVersion,
  slotContext = createEmptySlotContext(version),
) => {
  const formatter = createRecipeFormatter(version);

  return buildJava({
    state: extractCookingInput(recipe),
    formatter,
    version,
    slotContext,
  });
};

const buildBedrockRecipe = (
  recipe: TestRecipe,
  slotContext = createEmptySlotContext(MinecraftVersion.Bedrock),
) => buildBedrock(extractCookingInput(recipe), slotContext);

describe("generate cooking", () => {
  describe("1.13", () => {
    it("should generate a smelting recipe", () => {
      const recipeSlice = makeRecipe({
        ...recipeStateDefaults,
        recipeType: RecipeType.Smelting,
        group: "",
        slots: {
          "cooking.ingredient": {
            type: "default_item",
            id: { id: "stone", namespace: "minecraft" },
            displayName: "stone",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V113,
          },
          "cooking.result": {
            type: "default_item",
            id: {
              id: "cobblestone",
              namespace: "minecraft",
            },
            displayName: "cobblestone",
            texture: "",
            count: 10,
            _version: MinecraftVersion.V113,
          },
        },
        crafting: {
          ...recipeStateDefaults.crafting,
          shapeless: true,
          keepWhitespace: false,
        },
        cooking: {
          time: 10,
          experience: 10,
        },
      });
      expect(buildJavaRecipe(recipeSlice, MinecraftVersion.V113)).toEqual({
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
      const recipeSlice = makeRecipe({
        ...recipeStateDefaults,
        recipeType: RecipeType.Smelting,
        group: "",
        slots: {
          "cooking.ingredient": {
            type: "default_item",
            id: {
              id: "porkchop",
              namespace: "minecraft",
            },
            displayName: "stone",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V114,
          },
          "cooking.result": {
            type: "default_item",
            id: {
              id: "cooked_porkchop",
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
          time: 10,
          experience: 10,
        },
      });
      expect(buildJavaRecipe(recipeSlice, MinecraftVersion.V114)).toEqual({
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
      const recipeSlice = makeRecipe({
        ...recipeStateDefaults,
        recipeType: RecipeType.CampfireCooking,
        group: "",
        slots: {
          "cooking.ingredient": {
            type: "default_item",
            id: {
              id: "potato",
              namespace: "minecraft",
            },
            displayName: "potato",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V114,
          },
          "cooking.result": {
            type: "default_item",
            id: {
              id: "baked_potato",
              namespace: "minecraft",
            },
            displayName: "baked_potato",
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
          time: 10,
          experience: 10,
        },
      });
      expect(buildJavaRecipe(recipeSlice, MinecraftVersion.V114)).toEqual({
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
      const recipeSlice = makeRecipe({
        ...recipeStateDefaults,
        recipeType: RecipeType.Smoking,
        group: "",
        slots: {
          "cooking.ingredient": {
            type: "default_item",
            id: { id: "beef", namespace: "minecraft" },
            displayName: "beef",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V114,
          },
          "cooking.result": {
            type: "default_item",
            id: {
              id: "cooked_beef",
              namespace: "minecraft",
            },
            displayName: "cooked_beef",
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
          time: 10,
          experience: 10,
        },
      });
      expect(buildJavaRecipe(recipeSlice, MinecraftVersion.V114)).toEqual({
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
      const recipeSlice = makeRecipe({
        ...recipeStateDefaults,
        recipeType: RecipeType.Blasting,
        group: "",
        slots: {
          "cooking.ingredient": {
            type: "default_item",
            id: {
              id: "iron_ore",
              namespace: "minecraft",
            },
            displayName: "iron_ore",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V114,
          },
          "cooking.result": {
            type: "default_item",
            id: {
              id: "iron_ingot",
              namespace: "minecraft",
            },
            displayName: "iron_ingot",
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
          time: 10,
          experience: 10,
        },
      });
      expect(buildJavaRecipe(recipeSlice, MinecraftVersion.V114)).toEqual({
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

  describe("1.21+ and bedrock", () => {
    it("should generate 1.21 cooking with object result", () => {
      const recipeSlice = makeRecipe({
        ...recipeStateDefaults,
        recipeType: RecipeType.Smelting,
        group: "",
        slots: {
          "cooking.ingredient": {
            type: "default_item",
            id: { id: "iron_ore", namespace: "minecraft" },
            displayName: "iron_ore",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V121,
          },
          "cooking.result": {
            type: "default_item",
            id: { id: "iron_ingot", namespace: "minecraft" },
            displayName: "iron_ingot",
            texture: "",
            count: 2,
            _version: MinecraftVersion.V121,
          },
        },
        crafting: { ...recipeStateDefaults.crafting, shapeless: true, keepWhitespace: false },
        cooking: { time: 0, experience: 0 },
      });

      expect(buildJavaRecipe(recipeSlice, MinecraftVersion.V121)).toEqual({
        type: "minecraft:smelting",
        ingredient: { item: "minecraft:iron_ore" },
        result: { id: "minecraft:iron_ingot", count: 2 },
        experience: 0,
        cookingtime: 0,
      });
    });

    it("should generate bedrock furnace body", () => {
      const recipeSlice = makeRecipe({
        ...recipeStateDefaults,
        recipeType: RecipeType.Smelting,
        group: "",
        slots: {
          "cooking.ingredient": {
            type: "default_item",
            id: { id: "sand", namespace: "minecraft" },
            displayName: "sand",
            texture: "",
            count: 1,
            _version: MinecraftVersion.Bedrock,
          },
          "cooking.result": {
            type: "default_item",
            id: { id: "glass", namespace: "minecraft" },
            displayName: "glass",
            texture: "",
            count: 1,
            _version: MinecraftVersion.Bedrock,
          },
        },
        crafting: { ...recipeStateDefaults.crafting, shapeless: true, keepWhitespace: false },
        cooking: { time: 0, experience: 0 },
      });

      expect(buildBedrockRecipe(recipeSlice)).toEqual({
        input: "minecraft:sand",
        output: "minecraft:glass",
      });
    });

    it("should preserve legacy data on bedrock furnace input strings", () => {
      const recipeSlice = makeRecipe({
        ...recipeStateDefaults,
        recipeType: RecipeType.Smelting,
        group: "",
        slots: {
          "cooking.ingredient": {
            type: "default_item",
            id: { id: "wood", namespace: "minecraft", data: 4 },
            displayName: "wood",
            texture: "",
            count: 1,
            _version: MinecraftVersion.Bedrock,
          },
          "cooking.result": {
            type: "default_item",
            id: { id: "charcoal", namespace: "minecraft" },
            displayName: "charcoal",
            texture: "",
            count: 1,
            _version: MinecraftVersion.Bedrock,
          },
        },
        crafting: { ...recipeStateDefaults.crafting, shapeless: true, keepWhitespace: false },
        cooking: { time: 0, experience: 0 },
      });

      expect(buildBedrockRecipe(recipeSlice)).toEqual({
        input: "minecraft:wood:4",
        output: "minecraft:charcoal",
      });
    });

    it("should emit category for supported cooking recipes", () => {
      const recipeSlice = makeRecipe({
        ...recipeStateDefaults,
        recipeType: RecipeType.Blasting,
        group: "",
        category: "blocks",
        slots: {
          "cooking.ingredient": {
            type: "default_item",
            id: { id: "iron_ore", namespace: "minecraft" },
            displayName: "iron_ore",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V119,
          },
          "cooking.result": {
            type: "default_item",
            id: { id: "iron_ingot", namespace: "minecraft" },
            displayName: "iron_ingot",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V119,
          },
        },
        crafting: { ...recipeStateDefaults.crafting, shapeless: true, keepWhitespace: false },
        cooking: { time: 100, experience: 0.5 },
      });

      expect(buildJavaRecipe(recipeSlice, MinecraftVersion.V119)).toEqual({
        type: "minecraft:blasting",
        category: "blocks",
        ingredient: { item: "minecraft:iron_ore" },
        result: "minecraft:iron_ingot",
        experience: 0.5,
        cookingtime: 100,
      });
    });
  });

  it("throws when a placed custom result ref cannot be resolved", () => {
    const recipeSlice = makeRecipe({
      recipeType: RecipeType.Smelting,
      slots: {
        "cooking.ingredient": {
          type: "default_item",
          id: { id: "stone", namespace: "minecraft" },
          displayName: "stone",
          texture: "",
          _version: MinecraftVersion.V121,
        },
        "cooking.result": { kind: "custom_item", uid: "missing-result" },
      },
      cooking: { time: 10, experience: 0.5 },
    });

    expect(() =>
      buildJavaRecipe(
        recipeSlice,
        MinecraftVersion.V121,
        createEmptySlotContext(MinecraftVersion.V121),
      ),
    ).toThrow("Cannot generate output for unresolved custom_item reference");
  });
});
