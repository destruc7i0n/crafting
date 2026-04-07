import { describe, expect, it } from "vitest";

import { MinecraftVersion, RecipeType } from "@/data/types";

import { getSupportedRecipeTypesForVersion, recipeDefinitions, recipeResultSlots } from ".";

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
});
