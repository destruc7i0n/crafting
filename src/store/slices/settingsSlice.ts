import type { PayloadAction } from "@reduxjs/toolkit";

import { createAppSlice } from "../createAppSlice";

export interface SettingsSliceState {
  value: number;
  status: "idle" | "loading" | "failed";
}

const initialState: SettingsSliceState = {
  value: 0,
  status: "idle",
};

// If you are not using async thunks you can use the standalone `createSlice`.
export const settingsSlice = createAppSlice({
  name: "settings",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: (create) => ({
    increment: create.reducer((state) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.value += 1;
    }),
    decrement: create.reducer((state) => {
      state.value -= 1;
    }),
    // Use the `PayloadAction` type to declare the contents of `action.payload`
    incrementByAmount: create.reducer(
      (state, action: PayloadAction<number>) => {
        state.value += action.payload;
      },
    ),
  }),
  selectors: {},
});

// Action creators are generated for each case reducer function.
export const { decrement, increment, incrementByAmount } =
  settingsSlice.actions;
