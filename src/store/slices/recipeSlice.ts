import type { PayloadAction } from "@reduxjs/toolkit";

import { Item as ItemModel } from "@/data/models/item/Item";
import { RecipeType } from "@/data/types";

import { createAppSlice } from "../createAppSlice";

type CraftingSlots =
  | "crafting.1"
  | "crafting.2"
  | "crafting.3"
  | "crafting.4"
  | "crafting.5"
  | "crafting.6"
  | "crafting.7"
  | "crafting.8"
  | "crafting.9"
  | "crafting.result";
type CookingSlots = "cooking.ingredient" | "cooking.result";
type SmithingSlots =
  | "smithing.template"
  | "smithing.base"
  | "smithing.addition"
  | "smithing.result";
type StonecuttingSlots = "stonecutting.ingredient" | "stonecutting.result";

export type RecipeSlot =
  | CraftingSlots
  | CookingSlots
  | SmithingSlots
  | StonecuttingSlots;

export interface RecipeSliceState {
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

const initialState: RecipeSliceState = {
  recipeType: RecipeType.Crafting,
  group: "",
  slots: {},
  crafting: {
    shapeless: false,
    keepWhitespace: false,
  },
  cooking: {
    time: 0,
    experience: 0,
  },
  // smithing: {},
};

// If you are not using async thunks you can use the standalone `createSlice`.
export const recipeSlice = createAppSlice({
  name: "recipe",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: (create) => ({
    setGroup: create.reducer((state, action: PayloadAction<string>) => {
      state.group = action.payload;
    }),
    setSlot: create.reducer(
      (
        state,
        action: PayloadAction<{ slot: RecipeSlot; item?: ItemModel }>,
      ) => {
        state.slots[action.payload.slot] = action.payload.item;
      },
    ),
    setCrafting: create.reducer(
      (state, action: PayloadAction<RecipeSliceState["crafting"]>) => {
        state.crafting = action.payload;
      },
    ),
    setCraftingShapeless: create.reducer(
      (state, action: PayloadAction<boolean>) => {
        state.crafting.shapeless = action.payload;
      },
    ),
    setCraftingKeepWhitespace: create.reducer(
      (state, action: PayloadAction<boolean>) => {
        state.crafting.keepWhitespace = action.payload;
      },
    ),
    setCookingTime: create.reducer((state, action: PayloadAction<number>) => {
      state.cooking.time = action.payload;
    }),
    setCookingExperience: create.reducer(
      (state, action: PayloadAction<number>) => {
        state.cooking.experience = action.payload;
      },
    ),
  }),
  selectors: {},
});
