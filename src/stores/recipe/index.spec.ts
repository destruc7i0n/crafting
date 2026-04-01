import { beforeEach, describe, expect, it } from "vitest";

import { IngredientItem } from "@/data/models/types";
import { MinecraftVersion, RecipeType, SLOTS } from "@/data/types";

import { SingleRecipeState, useRecipeStore } from "./index";

const createRecipe = (id: string): SingleRecipeState => ({
  id,
  nameMode: "auto",
  name: "",
  recipeType: RecipeType.Crafting,
  group: "",
  category: "",
  showNotification: true,
  smithingTrimPattern: "",
  slots: {},
  crafting: {
    shapeless: false,
    keepWhitespace: false,
    twoByTwo: false,
  },
  cooking: {
    time: 0,
    experience: 0,
  },
  bedrock: {
    identifierMode: "auto",
    identifierName: "",
    priority: 0,
  },
});

const createItem = (id: string): IngredientItem => ({
  type: "default_item",
  id: { namespace: "minecraft", id },
  displayName: id,
  texture: `${id}.png`,
  _version: MinecraftVersion.V121,
});

describe("recipe store", () => {
  beforeEach(() => {
    useRecipeStore.setState((state) => ({
      ...state,
      recipes: [createRecipe("recipe_1")],
      selectedRecipeIndex: 0,
    }));
  });

  it("defaults Exact position to unchecked", () => {
    expect(useRecipeStore.getState().recipes[0]?.crafting.keepWhitespace).toBe(false);
  });

  it("keeps the same logical recipe selected when deleting an earlier recipe", () => {
    useRecipeStore.setState((state) => ({
      ...state,
      recipes: [createRecipe("recipe_1"), createRecipe("recipe_2"), createRecipe("recipe_3")],
      selectedRecipeIndex: 2,
    }));

    useRecipeStore.getState().deleteRecipe(0);

    expect(useRecipeStore.getState().selectedRecipeIndex).toBe(1);
  });

  it("keeps the current selection when deleting a later recipe", () => {
    useRecipeStore.setState((state) => ({
      ...state,
      recipes: [createRecipe("recipe_1"), createRecipe("recipe_2"), createRecipe("recipe_3")],
      selectedRecipeIndex: 0,
    }));

    useRecipeStore.getState().deleteRecipe(2);

    expect(useRecipeStore.getState().selectedRecipeIndex).toBe(0);
  });

  it("selects the next recipe when deleting the selected one", () => {
    useRecipeStore.setState((state) => ({
      ...state,
      recipes: [createRecipe("recipe_1"), createRecipe("recipe_2"), createRecipe("recipe_3")],
      selectedRecipeIndex: 1,
    }));

    useRecipeStore.getState().deleteRecipe(1);

    expect(useRecipeStore.getState().selectedRecipeIndex).toBe(1);
    expect(useRecipeStore.getState().recipes[1]?.id).toBe("recipe_3");
  });

  it("falls back to the previous recipe when deleting the last selected recipe", () => {
    useRecipeStore.setState((state) => ({
      ...state,
      recipes: [createRecipe("recipe_1"), createRecipe("recipe_2"), createRecipe("recipe_3")],
      selectedRecipeIndex: 2,
    }));

    useRecipeStore.getState().deleteRecipe(2);

    expect(useRecipeStore.getState().selectedRecipeIndex).toBe(1);
    expect(useRecipeStore.getState().recipes[1]?.id).toBe("recipe_2");
  });

  it("keeps the final recipe when deleteRecipe is called with only one recipe left", () => {
    useRecipeStore.getState().deleteRecipe(0);

    expect(useRecipeStore.getState().selectedRecipeIndex).toBe(0);
    expect(useRecipeStore.getState().recipes).toHaveLength(1);
    expect(useRecipeStore.getState().recipes[0]?.id).toBe("recipe_1");
  });

  it("creates recipes with auto naming defaults", () => {
    useRecipeStore.getState().createRecipe();

    expect(useRecipeStore.getState().recipes[1]).toMatchObject({
      nameMode: "auto",
      name: "",
      bedrock: {
        identifierMode: "auto",
        identifierName: "",
        priority: 0,
      },
    });
  });

  it("clears only the selected recipe slots and preserves its other fields", () => {
    const firstRecipe = createRecipe("recipe_1");
    firstRecipe.slots = {
      [SLOTS.crafting.slot1]: createItem("oak_log"),
    };

    const secondRecipe = createRecipe("recipe_2");
    secondRecipe.nameMode = "manual";
    secondRecipe.name = "polished_stone";
    secondRecipe.group = "building";
    secondRecipe.category = "decorations";
    secondRecipe.crafting = {
      shapeless: true,
      keepWhitespace: true,
      twoByTwo: true,
    };
    secondRecipe.cooking = {
      time: 200,
      experience: 0.35,
    };
    secondRecipe.bedrock = {
      identifierMode: "manual",
      identifierName: "stone_recipe",
      priority: 3,
    };
    secondRecipe.slots = {
      [SLOTS.crafting.slot1]: createItem("stone"),
      [SLOTS.crafting.result]: createItem("polished_andesite"),
    };

    useRecipeStore.setState((state) => ({
      ...state,
      recipes: [firstRecipe, secondRecipe],
      selectedRecipeIndex: 1,
    }));

    useRecipeStore.getState().clearSelectedRecipeSlots();

    expect(useRecipeStore.getState().recipes[0]?.slots).toEqual({
      [SLOTS.crafting.slot1]: expect.objectContaining({
        displayName: "oak_log",
      }),
    });
    expect(useRecipeStore.getState().recipes[1]).toMatchObject({
      id: "recipe_2",
      nameMode: "manual",
      name: "polished_stone",
      group: "building",
      category: "decorations",
      crafting: {
        shapeless: true,
        keepWhitespace: true,
        twoByTwo: true,
      },
      cooking: {
        time: 200,
        experience: 0.35,
      },
      bedrock: {
        identifierMode: "manual",
        identifierName: "stone_recipe",
        priority: 3,
      },
      slots: {},
    });
  });
});
