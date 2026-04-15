import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { IngredientItem } from "@/data/models/types";
import { RecipeType } from "@/data/types";
import { getRecipeDefinition } from "@/recipes/definitions";
import { RecipeSlot } from "@/recipes/slots";

import {
  normalizePersistedRecipeState,
  PersistedRecipeState,
  RECIPE_STORE_NAME,
  RECIPE_STORE_VERSION,
} from "./persistence";
import { selectCurrentRecipe } from "./selectors";
import { toRecipeSlotValue } from "./slot-value";
import { createDefaultRecipe, Recipe, RecipeSlotValue, RecipeState } from "./types";
import { cloneRecipe as cloneStoredRecipe } from "./utilities";

type RecipeActions = {
  selectRecipe: (id: string) => void;
  createRecipe: () => void;
  cloneRecipe: (id: string) => void;
  deleteRecipe: (id: string) => void;
  clearSelectedRecipeSlots: () => void;

  setRecipeNameMode: (mode: Recipe["nameMode"]) => void;
  setRecipeName: (name: string) => void;
  setRecipeType: (type: RecipeType) => void;
  setRecipeGroup: (group: string) => void;
  setRecipeCategory: (category: string) => void;
  setRecipeShowNotification: (showNotification: boolean) => void;
  setRecipeSmithingTrimPattern: (pattern: string) => void;
  setRecipeSlot: (slot: RecipeSlot, value?: RecipeSlotValue) => void;
  setRecipeSlotFromIngredient: (slot: RecipeSlot, item?: IngredientItem) => void;
  setRecipeSlotCount: (slot: RecipeSlot, count: number) => void;
  setRecipeCraftingShapeless: (shapeless: boolean) => void;
  setRecipeCraftingKeepWhitespace: (keepWhitespace: boolean) => void;
  setRecipeCraftingTwoByTwo: (twoByTwo: boolean) => void;
  setRecipeCookingTime: (time: number) => void;
  setRecipeCookingExperience: (experience: number) => void;
  setRecipeBedrockIdentifierMode: (mode: Recipe["bedrock"]["identifierMode"]) => void;
  setRecipeBedrockIdentifierName: (identifierName: string) => void;
  setRecipeBedrockPriority: (priority: number) => void;
  removeMatchingSlotValues: (match: (value: RecipeSlotValue) => boolean) => void;
  clearAllSlots: () => void;
};

type ImmerState = RecipeState & RecipeActions;

export const useRecipeStore = create<ImmerState>()(
  persist<ImmerState, [], [["zustand/immer", never]], PersistedRecipeState>(
    immer((set) => {
      const initialRecipe = createDefaultRecipe();

      const updateSelectedRecipe = (update: (recipe: Recipe) => void) =>
        set((state) => {
          const recipe = selectCurrentRecipe(state);
          if (recipe) {
            update(recipe);
          }
        });

      return {
        recipes: [initialRecipe],
        selectedRecipeId: initialRecipe.id,

        selectRecipe: (id) => {
          set((state) => {
            if (state.recipes.some((recipe) => recipe.id === id)) {
              state.selectedRecipeId = id;
            }
          });
        },
        createRecipe: () => {
          set((state) => {
            const recipe = createDefaultRecipe();
            state.recipes.push(recipe);
            state.selectedRecipeId = recipe.id;
          });
        },
        cloneRecipe: (id) => {
          set((state) => {
            const index = state.recipes.findIndex((recipe) => recipe.id === id);
            if (index < 0) {
              return;
            }

            const sourceRecipe = state.recipes[index];
            if (!sourceRecipe) {
              return;
            }

            const clonedRecipe = cloneStoredRecipe(sourceRecipe);
            state.recipes.splice(index + 1, 0, clonedRecipe);
            state.selectedRecipeId = clonedRecipe.id;
          });
        },
        deleteRecipe: (id) => {
          set((state) => {
            if (state.recipes.length <= 1) {
              return;
            }

            const index = state.recipes.findIndex((recipe) => recipe.id === id);
            if (index < 0) {
              return;
            }

            const isDeletingSelected = state.selectedRecipeId === id;
            state.recipes.splice(index, 1);

            if (isDeletingSelected) {
              const nextRecipe = state.recipes[Math.min(index, state.recipes.length - 1)];
              state.selectedRecipeId = nextRecipe?.id ?? "";
            }
          });
        },
        clearSelectedRecipeSlots: () => {
          updateSelectedRecipe((recipe) => {
            recipe.slots = {};
          });
        },
        setRecipeNameMode: (mode) => {
          updateSelectedRecipe((recipe) => {
            recipe.nameMode = mode;
          });
        },
        setRecipeName: (name) => {
          updateSelectedRecipe((recipe) => {
            recipe.name = name;
          });
        },
        setRecipeType: (type) => {
          updateSelectedRecipe((recipe) => {
            recipe.recipeType = type;

            for (const slot of Object.keys(recipe.slots) as RecipeSlot[]) {
              if (getRecipeDefinition(type).slots.isDisabled(recipe, slot)) {
                recipe.slots[slot] = undefined;
              }
            }
          });
        },
        setRecipeGroup: (group) => {
          updateSelectedRecipe((recipe) => {
            recipe.group = group;
          });
        },
        setRecipeCategory: (category) => {
          updateSelectedRecipe((recipe) => {
            recipe.category = category;
          });
        },
        setRecipeShowNotification: (showNotification) => {
          updateSelectedRecipe((recipe) => {
            recipe.showNotification = showNotification;
          });
        },
        setRecipeSmithingTrimPattern: (pattern) => {
          updateSelectedRecipe((recipe) => {
            recipe.smithing.trimPattern = pattern;
          });
        },
        setRecipeSlot: (slot, value) => {
          updateSelectedRecipe((recipe) => {
            recipe.slots[slot] = value;
          });
        },
        setRecipeSlotFromIngredient: (slot, item) => {
          updateSelectedRecipe((recipe) => {
            recipe.slots[slot] = item ? toRecipeSlotValue(item) : undefined;
          });
        },
        setRecipeSlotCount: (slot, count) => {
          updateSelectedRecipe((recipe) => {
            const value = recipe.slots[slot];
            if (!value || (value.kind !== "item" && value.kind !== "custom_item")) {
              return;
            }

            value.count = count;
          });
        },
        setRecipeCraftingShapeless: (shapeless) => {
          updateSelectedRecipe((recipe) => {
            recipe.crafting.shapeless = shapeless;
          });
        },
        setRecipeCraftingKeepWhitespace: (keepWhitespace) => {
          updateSelectedRecipe((recipe) => {
            recipe.crafting.keepWhitespace = keepWhitespace;
          });
        },
        setRecipeCraftingTwoByTwo: (twoByTwo) => {
          updateSelectedRecipe((recipe) => {
            recipe.crafting.twoByTwo = twoByTwo;
          });
        },
        setRecipeCookingTime: (time) => {
          updateSelectedRecipe((recipe) => {
            recipe.cooking.time = time;
          });
        },
        setRecipeCookingExperience: (experience) => {
          updateSelectedRecipe((recipe) => {
            recipe.cooking.experience = experience;
          });
        },
        setRecipeBedrockIdentifierMode: (mode) => {
          updateSelectedRecipe((recipe) => {
            recipe.bedrock.identifierMode = mode;
          });
        },
        setRecipeBedrockIdentifierName: (identifierName) => {
          updateSelectedRecipe((recipe) => {
            recipe.bedrock.identifierName = identifierName;
          });
        },
        setRecipeBedrockPriority: (priority) => {
          updateSelectedRecipe((recipe) => {
            recipe.bedrock.priority = priority;
          });
        },
        removeMatchingSlotValues: (match) => {
          set((state) => {
            for (const recipe of state.recipes) {
              for (const [slot, slotValue] of Object.entries(recipe.slots) as [
                RecipeSlot,
                RecipeSlotValue | undefined,
              ][]) {
                if (slotValue && match(slotValue)) {
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
      name: RECIPE_STORE_NAME,
      version: RECIPE_STORE_VERSION,
      partialize: (state) => ({
        recipes: state.recipes,
        selectedRecipeId: state.selectedRecipeId,
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...normalizePersistedRecipeState(persistedState),
      }),
    },
  ),
);
