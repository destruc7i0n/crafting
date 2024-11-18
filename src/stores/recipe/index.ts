import rfdc from "rfdc";
import { v4 as uuid } from "uuid";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { Item as ItemModel } from "@/data/models/types";
import { RecipeSlot, RecipeType } from "@/data/types";

export interface SingleRecipeState {
  recipeName: string;
  recipeType: RecipeType;
  group: string;
  slots: Partial<Record<RecipeSlot, ItemModel>>;
  crafting: {
    shapeless: boolean;
    keepWhitespace: boolean;
  };
  cooking: {
    time: number;
    experience: number;
  };
  // smithing: {};
}

export type RecipeState = {
  recipes: SingleRecipeState[];
  selectedRecipeIndex: number;
};

type RecipeActions = {
  selectRecipe: (index: number) => void;
  createRecipe: () => void;
  deleteRecipe: (index: number) => void;

  setRecipeName: (name: string) => void;
  setRecipeType: (type: RecipeType) => void;
  setRecipeGroup: (group: string) => void;
  setRecipeSlot: (slot: RecipeSlot, item?: ItemModel) => void;
  setRecipeCraftingShapeless: (shapeless: boolean) => void;
  setRecipeCraftingKeepWhitespace: (keepWhitespace: boolean) => void;
  setRecipeCookingTime: (time: number) => void;
  setRecipeCoolingExperience: (experience: number) => void;
};

const clone = rfdc();
const getDefaultRecipe = (): SingleRecipeState => {
  const recipe: SingleRecipeState = {
    recipeName: "recipe_1",
    recipeType: RecipeType.Crafting,
    group: "",
    slots: {},
    crafting: {
      shapeless: false,
      keepWhitespace: true,
    },
    cooking: {
      time: 0,
      experience: 0,
    },
    // smithing: {},
  };

  return clone(recipe);
};

export const useRecipeStore = create<RecipeState & RecipeActions>()(
  immer((set) => ({
    recipes: [getDefaultRecipe()],
    selectedRecipeIndex: 0,

    selectRecipe: (index: number) => {
      set((state) => {
        state.selectedRecipeIndex = index;
      });
    },
    createRecipe: () => {
      set((state) => {
        const recipe: SingleRecipeState = getDefaultRecipe();
        const name = `recipe_${uuid()}`;
        recipe.recipeName = name;

        state.recipes.push(recipe);
        state.selectedRecipeIndex = state.recipes.length - 1;
      });
    },
    deleteRecipe: (index: number) => {
      set((state) => {
        // set the selected recipe to the next one
        state.selectedRecipeIndex = Math.max(0, index - 1);
        state.recipes.splice(index, 1);
      });
    },
    setRecipeName: (name: string) => {
      set((state) => {
        state.recipes[state.selectedRecipeIndex].recipeName = name;
      });
    },
    setRecipeType: (type: RecipeType) => {
      set((state) => {
        state.recipes[state.selectedRecipeIndex].recipeType = type;
      });
    },
    setRecipeGroup: (group: string) => {
      set((state) => {
        state.recipes[state.selectedRecipeIndex].group = group;
      });
    },
    setRecipeSlot: (slot: RecipeSlot, item?: ItemModel) => {
      set((state) => {
        state.recipes[state.selectedRecipeIndex].slots[slot] = item;
      });
    },
    setRecipeCraftingShapeless: (shapeless: boolean) => {
      set((state) => {
        state.recipes[state.selectedRecipeIndex].crafting.shapeless = shapeless;
      });
    },
    setRecipeCraftingKeepWhitespace: (keepWhitespace: boolean) => {
      set((state) => {
        state.recipes[state.selectedRecipeIndex].crafting.keepWhitespace =
          keepWhitespace;
      });
    },
    setRecipeCookingTime: (time: number) => {
      set((state) => {
        state.recipes[state.selectedRecipeIndex].cooking.time = time;
      });
    },
    setRecipeCoolingExperience: (experience: number) => {
      set((state) => {
        state.recipes[state.selectedRecipeIndex].cooking.experience =
          experience;
      });
    },
  })),
);
