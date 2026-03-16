import { SingleRecipeState } from "@/stores/recipe";

import { MinecraftVersion, RecipeType } from "@/data/types";

import { validateRecipe } from "./validate-recipe";

const createItem = (raw: string, version = MinecraftVersion.V121) => ({
  type: "default_item" as const,
  id: {
    raw,
    id: raw.split(":").at(-1) ?? raw,
    namespace: raw.includes(":") ? raw.split(":")[0] : "minecraft",
  },
  displayName: raw,
  texture: "",
  _version: version,
});

const createRecipe = (
  recipeType: RecipeType,
  slots: SingleRecipeState["slots"] = {},
  overrides: Partial<SingleRecipeState> = {},
): SingleRecipeState => ({
  recipeType,
  recipeName: "recipe_1",
  group: "",
  slots,
  crafting: {
    shapeless: false,
    keepWhitespace: false,
    twoByTwo: false,
  },
  cooking: {
    time: 0,
    experience: 0,
  },
  ...overrides,
});

describe("validateRecipe", () => {
  it("requires a file name for Java exports", () => {
    const recipe = createRecipe(
      RecipeType.Crafting,
      {
        "crafting.1": createItem("minecraft:stone"),
        "crafting.result": createItem("minecraft:stone_button"),
      },
      {
        recipeName: "",
      },
    );

    expect(validateRecipe(recipe, MinecraftVersion.V121)).toEqual({
      valid: false,
      errors: ["Add a file name"],
    });
  });

  it("requires a crafting ingredient and result", () => {
    const recipe = createRecipe(RecipeType.Crafting);

    expect(validateRecipe(recipe, MinecraftVersion.V121)).toEqual({
      valid: false,
      errors: ["Add at least one crafting ingredient", "Add a result item"],
    });
  });

  it("ignores disabled 2x2 slots when validating crafting", () => {
    const recipe = createRecipe(
      RecipeType.Crafting,
      {
        "crafting.3": createItem("minecraft:stick"),
        "crafting.result": createItem("minecraft:ladder"),
      },
      {
        crafting: {
          shapeless: false,
          keepWhitespace: false,
          twoByTwo: true,
        },
      },
    );

    expect(validateRecipe(recipe, MinecraftVersion.V121)).toEqual({
      valid: false,
      errors: ["Add at least one crafting ingredient"],
    });
  });

  it("requires ingredient and result for cooking recipes", () => {
    const recipe = createRecipe(RecipeType.Smelting, {
      "cooking.ingredient": createItem("minecraft:iron_ore"),
    });

    expect(validateRecipe(recipe, MinecraftVersion.V121)).toEqual({
      valid: false,
      errors: ["Add a result item"],
    });
  });

  it("allows smithing trim without a result slot", () => {
    const recipe = createRecipe(RecipeType.SmithingTrim, {
      "smithing.template": createItem("minecraft:coast_armor_trim_smithing_template"),
      "smithing.base": createItem("minecraft:diamond_chestplate"),
      "smithing.addition": createItem("minecraft:redstone"),
    });

    expect(validateRecipe(recipe, MinecraftVersion.V121)).toEqual({
      valid: true,
      errors: [],
    });
  });

  it("requires a result for smithing transform", () => {
    const recipe = createRecipe(RecipeType.SmithingTransform, {
      "smithing.template": createItem("minecraft:netherite_upgrade_smithing_template"),
      "smithing.base": createItem("minecraft:diamond_sword"),
      "smithing.addition": createItem("minecraft:netherite_ingot"),
    });

    expect(validateRecipe(recipe, MinecraftVersion.V121)).toEqual({
      valid: false,
      errors: ["Add a result item"],
    });
  });

  it("reports unsupported recipe types for the selected version", () => {
    const recipe = createRecipe(RecipeType.Stonecutter, {
      "stonecutter.ingredient": createItem("minecraft:stone", MinecraftVersion.V113),
      "stonecutter.result": createItem("minecraft:stone_slab", MinecraftVersion.V113),
    });

    expect(validateRecipe(recipe, MinecraftVersion.V113)).toEqual({
      valid: false,
      errors: ["Recipe type is not available in Java 1.13"],
    });
  });

  it("delegates transmute validation to its own module", () => {
    const recipe = createRecipe(RecipeType.CraftingTransmute);

    expect(validateRecipe(recipe, MinecraftVersion.V12111)).toEqual({
      valid: false,
      errors: [
        "Recipe type is not available in Java 1.21.11",
        "Add an input item",
        "Add a material item",
        "Add a result item",
      ],
    });
  });

  it("requires a trim pattern for smithing trim on 1.21.5+", () => {
    const recipe = createRecipe(RecipeType.SmithingTrim, {
      "smithing.template": createItem("minecraft:coast_armor_trim_smithing_template"),
      "smithing.base": createItem("minecraft:diamond_chestplate"),
      "smithing.addition": createItem("minecraft:redstone"),
    });

    expect(validateRecipe(recipe, MinecraftVersion.V1215)).toEqual({
      valid: false,
      errors: ["Add a trim pattern"],
    });
  });
});
