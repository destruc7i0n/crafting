import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { MinecraftVersion } from "@/data/types";

export interface SettingsSliceState {
  minecraftVersion: MinecraftVersion;
}

const initialState: SettingsSliceState = {
  minecraftVersion: MinecraftVersion.V120,
};

// If you are not using async thunks you can use the standalone `createSlice`.
export const settingsSlice = createSlice({
  name: "settings",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setMinecraftVersion: (state, action: PayloadAction<MinecraftVersion>) => {
      state.minecraftVersion = action.payload;
    },
  },
  selectors: {},
});

export const { setMinecraftVersion } = settingsSlice.actions;
