import { v4 as uuid } from "uuid";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { Item as ItemModel } from "@/data/models/types";
import { RecipeSlot, RecipeType } from "@/data/types";

export interface SingleRecipeState {
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
  recipes: { [key: string]: SingleRecipeState };
  selectedRecipe: string;
};

type RecipeActions = {
  createRecipe: () => void;

  setRecipeType: (type: RecipeType) => void;
  setRecipeGroup: (group: string) => void;
  setRecipeSlot: (slot: RecipeSlot, item?: ItemModel) => void;
  setRecipeCraftingShapeless: (shapeless: boolean) => void;
  setRecipeCraftingKeepWhitespace: (keepWhitespace: boolean) => void;
  setRecipeCookingTime: (time: number) => void;
  setRecipeCoolingExperience: (experience: number) => void;
};

const getDefaultRecipe = (): SingleRecipeState => {
  const recipe: SingleRecipeState = {
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

  return recipe;
};

export const useRecipeStore = create<RecipeState & RecipeActions>()(
  immer((set) => ({
    recipes: {
      recipe: getDefaultRecipe(),
    },
    selectedRecipe: "recipe",

    createRecipe: () => {
      set((state) => {
        const recipe: SingleRecipeState = getDefaultRecipe();

        const key = `recipe-${uuid()}`;
        state.recipes[key] = recipe;
        state.selectedRecipe = key;
      });
    },
    setRecipeType: (type: RecipeType) => {
      set((state) => {
        state.recipes[state.selectedRecipe].recipeType = type;
      });
    },
    setRecipeGroup: (group: string) => {
      set((state) => {
        state.recipes[state.selectedRecipe].group = group;
      });
    },
    setRecipeSlot: (slot: RecipeSlot, item?: ItemModel) => {
      set((state) => {
        state.recipes[state.selectedRecipe].slots[slot] = item;
      });
    },
    setRecipeCraftingShapeless: (shapeless: boolean) => {
      set((state) => {
        state.recipes[state.selectedRecipe].crafting.shapeless = shapeless;
      });
    },
    setRecipeCraftingKeepWhitespace: (keepWhitespace: boolean) => {
      set((state) => {
        state.recipes[state.selectedRecipe].crafting.keepWhitespace =
          keepWhitespace;
      });
    },
    setRecipeCookingTime: (time: number) => {
      set((state) => {
        state.recipes[state.selectedRecipe].cooking.time = time;
      });
    },
    setRecipeCoolingExperience: (experience: number) => {
      set((state) => {
        state.recipes[state.selectedRecipe].cooking.experience = experience;
      });
    },
  })),
);