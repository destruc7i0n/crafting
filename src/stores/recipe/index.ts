import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { IngredientItem } from "@/data/models/types";
import { RecipeSlot, RecipeType } from "@/data/types";
import { generateUid } from "@/lib/utils";

export interface SingleRecipeState {
  id: string;
  nameMode: "auto" | "manual";
  name: string;
  recipeType: RecipeType;
  group: string;
  category: string;
  showNotification: boolean;
  smithingTrimPattern: string;
  slots: Partial<Record<RecipeSlot, IngredientItem>>;
  crafting: {
    shapeless: boolean;
    keepWhitespace: boolean;
    twoByTwo: boolean;
  };
  cooking: {
    time: number;
    experience: number;
  };
  bedrock: {
    identifierMode: "auto" | "manual";
    identifierName: string;
    priority: number;
  };
}

export const recipeStateDefaults: SingleRecipeState = {
  id: "",
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
  bedrock: { identifierMode: "auto", identifierName: "", priority: 0 },
};

export type RecipeState = {
  recipes: SingleRecipeState[];
  selectedRecipeIndex: number;
};

type RecipeActions = {
  selectRecipe: (index: number) => void;
  createRecipe: () => void;
  deleteRecipe: (index: number) => void;
  clearSelectedRecipeSlots: () => void;

  setRecipeNameMode: (mode: SingleRecipeState["nameMode"]) => void;
  setRecipeName: (name: string) => void;
  setRecipeType: (type: RecipeType) => void;
  setRecipeGroup: (group: string) => void;
  setRecipeCategory: (category: string) => void;
  setRecipeShowNotification: (showNotification: boolean) => void;
  setRecipeSmithingTrimPattern: (pattern: string) => void;
  setRecipeSlot: (slot: RecipeSlot, item?: IngredientItem) => void;
  setRecipeSlotCount: (slot: RecipeSlot, count: number) => void;
  setRecipeCraftingShapeless: (shapeless: boolean) => void;
  setRecipeCraftingKeepWhitespace: (keepWhitespace: boolean) => void;
  setRecipeCraftingTwoByTwo: (twoByTwo: boolean) => void;
  setRecipeCookingTime: (time: number) => void;
  setRecipeCookingExperience: (experience: number) => void;
  setRecipeBedrockIdentifierMode: (mode: SingleRecipeState["bedrock"]["identifierMode"]) => void;
  setRecipeBedrockIdentifierName: (identifierName: string) => void;
  setRecipeBedrockPriority: (priority: number) => void;
  syncCustomSlotItem: (
    match: (item: IngredientItem) => boolean,
    update: (item: IngredientItem) => void,
  ) => void;
  removeMatchingSlotItems: (match: (item: IngredientItem) => boolean) => void;
  clearAllSlots: () => void;
};

const createRecipeState = (): SingleRecipeState => ({
  ...recipeStateDefaults,
  id: generateUid("recipe"),
  slots: {},
  crafting: { ...recipeStateDefaults.crafting },
  cooking: { ...recipeStateDefaults.cooking },
  bedrock: { ...recipeStateDefaults.bedrock },
});

type ImmerState = RecipeState & RecipeActions;

const getSelectedRecipe = (state: ImmerState): SingleRecipeState | undefined =>
  state.recipes[state.selectedRecipeIndex];

const clampSelectedRecipeIndex = (index: number, recipeCount: number) =>
  Math.max(0, Math.min(index, recipeCount - 1));

export const useRecipeStore = create<ImmerState>()(
  persist(
    immer((set) => {
      const updateSelectedRecipe = (update: (recipe: SingleRecipeState) => void) =>
        set((state) => {
          const recipe = getSelectedRecipe(state);
          if (recipe) {
            update(recipe);
          }
        });

      return {
        recipes: [createRecipeState()],
        selectedRecipeIndex: 0,

        selectRecipe: (index: number) => {
          set((state) => {
            state.selectedRecipeIndex = index;
          });
        },
        createRecipe: () => {
          set((state) => {
            state.recipes.push(createRecipeState());
            state.selectedRecipeIndex = state.recipes.length - 1;
          });
        },
        deleteRecipe: (index: number) => {
          set((state) => {
            if (state.recipes.length <= 1) {
              return;
            }

            const nextRecipeCount = state.recipes.length - 1;
            state.selectedRecipeIndex =
              index < state.selectedRecipeIndex
                ? state.selectedRecipeIndex - 1
                : clampSelectedRecipeIndex(state.selectedRecipeIndex, nextRecipeCount);

            state.recipes.splice(index, 1);
          });
        },
        clearSelectedRecipeSlots: () => {
          updateSelectedRecipe((recipe) => {
            recipe.slots = {};
          });
        },
        setRecipeNameMode: (mode: SingleRecipeState["nameMode"]) => {
          updateSelectedRecipe((recipe) => {
            recipe.nameMode = mode;
          });
        },
        setRecipeName: (name: string) => {
          updateSelectedRecipe((recipe) => {
            recipe.name = name;
          });
        },
        setRecipeType: (type: RecipeType) => {
          updateSelectedRecipe((recipe) => {
            recipe.recipeType = type;
          });
        },
        setRecipeGroup: (group: string) => {
          updateSelectedRecipe((recipe) => {
            recipe.group = group;
          });
        },
        setRecipeCategory: (category: string) => {
          updateSelectedRecipe((recipe) => {
            recipe.category = category;
          });
        },
        setRecipeShowNotification: (showNotification: boolean) => {
          updateSelectedRecipe((recipe) => {
            recipe.showNotification = showNotification;
          });
        },
        setRecipeSmithingTrimPattern: (pattern: string) => {
          updateSelectedRecipe((recipe) => {
            recipe.smithingTrimPattern = pattern;
          });
        },
        setRecipeSlot: (slot: RecipeSlot, item?: IngredientItem) => {
          updateSelectedRecipe((recipe) => {
            recipe.slots[slot] = item;
          });
        },
        setRecipeSlotCount: (slot: RecipeSlot, count: number) => {
          set((state) => {
            const recipe = getSelectedRecipe(state);
            const item = recipe?.slots[slot];
            if (!item || item.type === "tag_item") return;
            item.count = count;
          });
        },
        setRecipeCraftingShapeless: (shapeless: boolean) => {
          updateSelectedRecipe((recipe) => {
            recipe.crafting.shapeless = shapeless;
          });
        },
        setRecipeCraftingKeepWhitespace: (keepWhitespace: boolean) => {
          updateSelectedRecipe((recipe) => {
            recipe.crafting.keepWhitespace = keepWhitespace;
          });
        },
        setRecipeCraftingTwoByTwo: (twoByTwo: boolean) => {
          updateSelectedRecipe((recipe) => {
            recipe.crafting.twoByTwo = twoByTwo;
          });
        },
        setRecipeCookingTime: (time: number) => {
          updateSelectedRecipe((recipe) => {
            recipe.cooking.time = time;
          });
        },
        setRecipeCookingExperience: (experience: number) => {
          updateSelectedRecipe((recipe) => {
            recipe.cooking.experience = experience;
          });
        },
        setRecipeBedrockIdentifierMode: (mode: SingleRecipeState["bedrock"]["identifierMode"]) => {
          updateSelectedRecipe((recipe) => {
            recipe.bedrock.identifierMode = mode;
          });
        },
        setRecipeBedrockIdentifierName: (identifierName: string) => {
          updateSelectedRecipe((recipe) => {
            recipe.bedrock.identifierName = identifierName;
          });
        },
        setRecipeBedrockPriority: (priority: number) => {
          updateSelectedRecipe((recipe) => {
            recipe.bedrock.priority = priority;
          });
        },
        syncCustomSlotItem: (match, update) => {
          set((state) => {
            for (const recipe of state.recipes) {
              for (const slotItem of Object.values(recipe.slots)) {
                if (slotItem && match(slotItem)) {
                  update(slotItem);
                }
              }
            }
          });
        },
        removeMatchingSlotItems: (match) => {
          set((state) => {
            for (const recipe of state.recipes) {
              for (const [slot, slotItem] of Object.entries(recipe.slots) as [
                RecipeSlot,
                IngredientItem | undefined,
              ][]) {
                if (slotItem && match(slotItem)) {
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
      };
    }),
    {
      name: "crafting-recipes",
      version: 0,
      partialize: (state) => ({
        recipes: state.recipes,
        selectedRecipeIndex: state.selectedRecipeIndex,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        if (!Array.isArray(state.recipes) || state.recipes.length === 0) {
          state.recipes = [createRecipeState()];
          state.selectedRecipeIndex = 0;
          return;
        }

        const selectedRecipeIndex = Number.isInteger(state.selectedRecipeIndex)
          ? state.selectedRecipeIndex
          : 0;
        state.selectedRecipeIndex = clampSelectedRecipeIndex(
          selectedRecipeIndex,
          state.recipes.length,
        );
      },
    },
  ),
);
