import { describe, expect, it } from "vitest";

import { MinecraftVersion, RecipeType } from "@/data/types";

import {
  coerceRecipeTypeForVersion,
  getSupportedRecipeTypesForVersion,
  recipeDefinitions,
  recipeResultSlots,
} from ".";

describe("recipe definitions", () => {
  it("covers every recipe type", () => {
    expect(Object.keys(recipeDefinitions).sort()).toEqual(Object.values(RecipeType).sort());
  });

  it("derives result slots from the registry", () => {
    expect(recipeResultSlots.sort()).toEqual([
      "cooking.result",
      "crafting.result",
      "smithing.result",
      "stonecutter.result",
    ]);
  });

  it("keeps disabled recipe types out of supported lists", () => {
    expect(getSupportedRecipeTypesForVersion(MinecraftVersion.V12111)).not.toContain(
      RecipeType.CraftingTransmute,
    );
  });

  it("returns the same type when the version supports it", () => {
    expect(coerceRecipeTypeForVersion(RecipeType.Smelting, MinecraftVersion.V114)).toBe(
      RecipeType.Smelting,
    );
  });

  it("falls back to the first supported type when the requested one is unsupported", () => {
    expect(coerceRecipeTypeForVersion(RecipeType.Smelting, MinecraftVersion.V112)).toBe(
      RecipeType.Crafting,
    );
  });

  it("falls back to the first supported type when the requested one is undefined", () => {
    expect(coerceRecipeTypeForVersion(undefined, MinecraftVersion.V121)).toBe(RecipeType.Crafting);
  });
});
