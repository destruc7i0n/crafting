import rfdc from "rfdc";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { IngredientItem } from "@/data/models/types";
import { RecipeSlot, RecipeType } from "@/data/types";

export interface SingleRecipeState {
  id?: string;
  recipeName?: string;
  recipeType: RecipeType;
  group: string;
  category?: string;
  showNotification?: boolean;
  smithingTrimPattern?: string;
  slots: Partial<Record<RecipeSlot, IngredientItem>>;
  crafting: {
    shapeless: boolean;
    keepWhitespace: boolean;
    twoByTwo?: boolean;
  };
  cooking: {
    time: number;
    experience: number;
  };
  bedrock?: {
    identifier: string;
    priority: number;
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
  setRecipeNameAtIndex: (index: number, name: string) => void;
  setRecipeType: (type: RecipeType) => void;
  setRecipeGroup: (group: string) => void;
  setRecipeCategory: (category?: string) => void;
  setRecipeShowNotification: (showNotification: boolean) => void;
  setRecipeSmithingTrimPattern: (pattern?: string) => void;
  setRecipeSlot: (slot: RecipeSlot, item?: IngredientItem) => void;
  setRecipeSlotCount: (slot: RecipeSlot, count: number) => void;
  setRecipeCraftingShapeless: (shapeless: boolean) => void;
  setRecipeCraftingKeepWhitespace: (keepWhitespace: boolean) => void;
  setRecipeCraftingTwoByTwo: (twoByTwo: boolean) => void;
  setRecipeCookingTime: (time: number) => void;
  setRecipeCoolingExperience: (experience: number) => void;
  setRecipeBedrockIdentifier: (identifier: string) => void;
  setRecipeBedrockPriority: (priority: number) => void;
  syncCustomSlotItem: (
    match: (item: IngredientItem) => boolean,
    update: (item: IngredientItem) => void,
  ) => void;
  removeCustomTagFromSlots: (tagUid: string) => void;
  clearAllSlots: () => void;
};

const clone = rfdc();
const createRecipeId = () =>
  globalThis.crypto?.randomUUID?.() ?? `recipe-${Math.random().toString(36).slice(2)}`;

const getDefaultRecipe = (): SingleRecipeState => {
  const recipe: SingleRecipeState = {
    id: createRecipeId(),
    recipeName: "recipe_1",
    recipeType: RecipeType.Crafting,
    group: "",
    slots: {},
    crafting: {
      shapeless: false,
      keepWhitespace: true,
      twoByTwo: false,
    },
    cooking: {
      time: 0,
      experience: 0,
    },
    bedrock: {
      identifier: "crafting:recipe",
      priority: 0,
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
        const existingNumbers = state.recipes
          .map((r) => r.recipeName?.match(/^recipe_(\d+)$/))
          .filter(Boolean)
          .map((m) => Number(m![1]));
        const next = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
        recipe.recipeName = `recipe_${next}`;

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
    setRecipeNameAtIndex: (index: number, name: string) => {
      set((state) => {
        state.recipes[index].recipeName = name;
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
    setRecipeCategory: (category?: string) => {
      set((state) => {
        state.recipes[state.selectedRecipeIndex].category = category;
      });
    },
    setRecipeShowNotification: (showNotification: boolean) => {
      set((state) => {
        state.recipes[state.selectedRecipeIndex].showNotification = showNotification;
      });
    },
    setRecipeSmithingTrimPattern: (pattern?: string) => {
      set((state) => {
        state.recipes[state.selectedRecipeIndex].smithingTrimPattern = pattern;
      });
    },
    setRecipeSlot: (slot: RecipeSlot, item?: IngredientItem) => {
      set((state) => {
        state.recipes[state.selectedRecipeIndex].slots[slot] = item;
      });
    },
    setRecipeSlotCount: (slot: RecipeSlot, count: number) => {
      set((state) => {
        const item = state.recipes[state.selectedRecipeIndex].slots[slot];
        if (!item || item.type === "tag_item") {
          return;
        }

        item.count = count;
      });
    },
    setRecipeCraftingShapeless: (shapeless: boolean) => {
      set((state) => {
        state.recipes[state.selectedRecipeIndex].crafting.shapeless = shapeless;
      });
    },
    setRecipeCraftingKeepWhitespace: (keepWhitespace: boolean) => {
      set((state) => {
        state.recipes[state.selectedRecipeIndex].crafting.keepWhitespace = keepWhitespace;
      });
    },
    setRecipeCraftingTwoByTwo: (twoByTwo: boolean) => {
      set((state) => {
        state.recipes[state.selectedRecipeIndex].crafting.twoByTwo = twoByTwo;
      });
    },
    setRecipeCookingTime: (time: number) => {
      set((state) => {
        state.recipes[state.selectedRecipeIndex].cooking.time = time;
      });
    },
    setRecipeCoolingExperience: (experience: number) => {
      set((state) => {
        state.recipes[state.selectedRecipeIndex].cooking.experience = experience;
      });
    },
    setRecipeBedrockIdentifier: (identifier: string) => {
      set((state) => {
        const recipe = state.recipes[state.selectedRecipeIndex];
        if (!recipe) return;

        recipe.bedrock ??= {
          identifier: "crafting:recipe",
          priority: 0,
        };
        recipe.bedrock.identifier = identifier;
      });
    },
    setRecipeBedrockPriority: (priority: number) => {
      set((state) => {
        const recipe = state.recipes[state.selectedRecipeIndex];
        if (!recipe) return;

        recipe.bedrock ??= {
          identifier: "crafting:recipe",
          priority: 0,
        };
        recipe.bedrock.priority = priority;
      });
    },
    syncCustomSlotItem: (match, update) => {
      set((state) => {
        for (const recipe of state.recipes) {
          for (const [, slotItem] of Object.entries(recipe.slots) as [
            RecipeSlot,
            IngredientItem | undefined,
          ][]) {
            if (slotItem && match(slotItem)) {
              update(slotItem);
            }
          }
        }
      });
    },
    removeCustomTagFromSlots: (tagUid: string) => {
      set((state) => {
        for (const recipe of state.recipes) {
          for (const [slot, slotItem] of Object.entries(recipe.slots) as [
            RecipeSlot,
            IngredientItem | undefined,
          ][]) {
            if (slotItem?.type === "tag_item" && slotItem.tagUid === tagUid) {
              recipe.slots[slot] = undefined;
            }
          }
        }
      });
    },
    clearAllSlots: () => {
      set((state) => {
        for (const recipe of state.recipes) {
          recipe.slots = {};
        }
      });
    },
  })),
);
