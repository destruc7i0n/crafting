import { MinecraftVersion, RecipeType } from "@/data/types";
import { createEmptySlotContext } from "@/stores/recipe/slot-value";
import { recipeStateDefaults } from "@/stores/recipe/types";
import { makeRecipe } from "@/test/recipe-fixtures";

import { createRecipeFormatter } from "./format/recipe-formatter";
import { buildBedrock, buildJava, extractStonecutterInput } from "./stonecutter";

type TestRecipe = ReturnType<typeof makeRecipe>;

const buildJavaRecipe = (
  recipe: TestRecipe,
  version: MinecraftVersion,
  slotContext = createEmptySlotContext(version),
) => {
  const formatter = createRecipeFormatter(version);

  return buildJava({
    state: extractStonecutterInput(recipe),
    formatter,
    version,
    slotContext,
  });
};

const buildBedrockRecipe = (
  recipe: TestRecipe,
  slotContext = createEmptySlotContext(MinecraftVersion.Bedrock),
) => {
  const formatter = createRecipeFormatter(MinecraftVersion.Bedrock);

  return buildBedrock(extractStonecutterInput(recipe), formatter, slotContext);
};

describe("generate stonecutting", () => {
  describe("1.14", () => {
    it("should generate a stonecutting recipe", () => {
      const recipeSlice = makeRecipe({
        ...recipeStateDefaults,
        recipeType: RecipeType.Stonecutter,
        group: "",
        slots: {
          "stonecutter.ingredient": {
            type: "default_item",
            id: { id: "stone", namespace: "minecraft" },
            displayName: "stone",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V114,
          },
          "stonecutter.result": {
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

      expect(buildJavaRecipe(recipeSlice, MinecraftVersion.V114)).toEqual({
        type: "minecraft:stonecutting",
        ingredient: {
          item: "minecraft:stone",
        },
        result: "minecraft:cobblestone",
        count: 10,
      });
    });
  });

  describe("1.21+ and bedrock", () => {
    it("should generate 1.21 stonecutting with object result", () => {
      const recipeSlice = makeRecipe({
        ...recipeStateDefaults,
        recipeType: RecipeType.Stonecutter,
        group: "",
        slots: {
          "stonecutter.ingredient": {
            type: "default_item",
            id: { id: "stone", namespace: "minecraft" },
            displayName: "stone",
            texture: "",
            count: 1,
            _version: MinecraftVersion.V121,
          },
          "stonecutter.result": {
            type: "default_item",
            id: { id: "stone_bricks", namespace: "minecraft" },
            displayName: "stone_bricks",
            texture: "",
            count: 2,
            _version: MinecraftVersion.V121,
          },
        },
        cooking: { experience: 0, time: 0 },
        crafting: { ...recipeStateDefaults.crafting, keepWhitespace: false, shapeless: false },
      });

      expect(buildJavaRecipe(recipeSlice, MinecraftVersion.V121)).toEqual({
        type: "minecraft:stonecutting",
        ingredient: { item: "minecraft:stone" },
        result: { id: "minecraft:stone_bricks", count: 2 },
      });
    });

    it("should generate bedrock stonecutter shapeless body", () => {
      const recipeSlice = makeRecipe({
        ...recipeStateDefaults,
        recipeType: RecipeType.Stonecutter,
        group: "",
        slots: {
          "stonecutter.ingredient": {
            type: "default_item",
            id: { id: "stone", namespace: "minecraft" },
            displayName: "stone",
            texture: "",
            count: 1,
            _version: MinecraftVersion.Bedrock,
          },
          "stonecutter.result": {
            type: "default_item",
            id: { id: "stone_bricks", namespace: "minecraft" },
            displayName: "stone_bricks",
            texture: "",
            count: 1,
            _version: MinecraftVersion.Bedrock,
          },
        },
        cooking: { experience: 0, time: 0 },
        crafting: { ...recipeStateDefaults.crafting, keepWhitespace: false, shapeless: false },
      });

      expect(buildBedrockRecipe(recipeSlice)).toEqual({
        ingredients: [{ item: "minecraft:stone" }],
        result: { item: "minecraft:stone_bricks", count: 1 },
      });
    });
  });

  describe("group field", () => {
    const makeSlice = (version: MinecraftVersion) =>
      makeRecipe({
        ...recipeStateDefaults,
        recipeType: RecipeType.Stonecutter,
        group: "stone_variants",
        slots: {
          "stonecutter.ingredient": {
            type: "default_item",
            id: { id: "stone", namespace: "minecraft" },
            displayName: "stone",
            texture: "",
            _version: version,
          },
          "stonecutter.result": {
            type: "default_item",
            id: { id: "stone_bricks", namespace: "minecraft" },
            displayName: "stone_bricks",
            texture: "",
            _version: version,
          },
        },
        cooking: { experience: 0, time: 0 },
        crafting: { ...recipeStateDefaults.crafting, keepWhitespace: false, shapeless: false },
      });

    it("includes group before 26.1", () => {
      expect(
        buildJavaRecipe(makeSlice(MinecraftVersion.V121), MinecraftVersion.V121),
      ).toMatchObject({
        group: "stone_variants",
      });
    });

    it("omits group on 26.1+ (no recipe book)", () => {
      const result = buildJavaRecipe(makeSlice(MinecraftVersion.V261), MinecraftVersion.V261);
      expect(result).not.toHaveProperty("group");
    });
  });

  it("throws when a placed custom result ref cannot be resolved", () => {
    const recipeSlice = makeRecipe({
      recipeType: RecipeType.Stonecutter,
      slots: {
        "stonecutter.ingredient": {
          type: "default_item",
          id: { id: "stone", namespace: "minecraft" },
          displayName: "stone",
          texture: "",
          _version: MinecraftVersion.V121,
        },
        "stonecutter.result": { kind: "custom_item", uid: "missing-result" },
      },
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
