// This file serves as a central hub for re-exporting pre-typed Redux hooks.
// These imports are restricted elsewhere to ensure consistent
// usage of typed hooks throughout the application.
// We disable the ESLint rule here because this is the designated place
// for importing and re-exporting the typed versions of hooks.
/* eslint-disable @typescript-eslint/no-restricted-imports */
import { createSelector } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";

import { RecipeSlot } from "./slices/recipeSlice";
import type { AppDispatch, RootState } from "./store";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export const selectSettings = (state: RootState) => state.settings;
export const selectMinecraftVersion = createSelector(
  selectSettings,
  (state) => state.minecraftVersion,
);

export const selectRecipe = (state: RootState) => state.recipe;
export const selectRecipeSlot = (slot: RecipeSlot) =>
  createSelector(selectRecipe, (state) => state.slots[slot]);

export const selectResources = (state: RootState) => state.resources;
export const selectResourcesByVersion = createSelector(
  [selectResources, selectMinecraftVersion],
  (state, version) => state[version],
);

export const selectResourceById = (id: string) =>
  createSelector(selectResourcesByVersion, (state) => state?.itemsById[id]);

export const selectTextureById = (id: string) =>
  createSelector(selectResourcesByVersion, (state) => state?.textures[id]);
