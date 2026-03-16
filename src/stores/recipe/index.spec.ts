import { beforeEach, describe, expect, it } from "vitest";

import { RecipeType } from "@/data/types";

import { SingleRecipeState, useRecipeStore } from "./index";

const createRecipe = (recipeName: string): SingleRecipeState => ({
  recipeType: RecipeType.Crafting,
  recipeName,
  group: "",
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
    identifier: `crafting:${recipeName}`,
    priority: 0,
  },
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
    expect(useRecipeStore.getState().recipes[1]?.recipeName).toBe("recipe_3");
  });

  it("falls back to the previous recipe when deleting the last selected recipe", () => {
    useRecipeStore.setState((state) => ({
      ...state,
      recipes: [createRecipe("recipe_1"), createRecipe("recipe_2"), createRecipe("recipe_3")],
      selectedRecipeIndex: 2,
    }));

    useRecipeStore.getState().deleteRecipe(2);

    expect(useRecipeStore.getState().selectedRecipeIndex).toBe(1);
    expect(useRecipeStore.getState().recipes[1]?.recipeName).toBe("recipe_2");
  });
});
