import { describe, expect, it } from "vitest";

import { MinecraftVersion, RecipeType } from "@/data/types";
import { toRecipeSlotValue } from "@/stores/recipe/slot-value";
import { Recipe } from "@/stores/recipe/types";
import { makeRecipe } from "@/test/recipe-fixtures";

import {
  canEditRecipeSlotCount,
  canRecipeSlotAcceptIngredientItem,
  canRecipeSlotAcceptSlotValue,
  findFirstEmptyRecipeSlot,
  isRecipeSlotDisabled,
  isResultSlot,
} from "./slots";

const makeCanonicalRecipe = (overrides: Parameters<typeof makeRecipe>[0] = {}): Recipe =>
  makeRecipe(overrides);

const makeItem = (id = "stone") => ({
  type: "default_item" as const,
  id: { namespace: "minecraft", id },
  displayName: id,
  texture: `${id}.png`,
  _version: MinecraftVersion.V121,
});

const makeTagItem = () => ({
  type: "tag_item" as const,
  id: { namespace: "minecraft", id: "logs" },
  displayName: "#minecraft:logs",
  texture: "logs.png",
  _version: MinecraftVersion.V121,
  tagSource: "vanilla" as const,
  values: ["minecraft:oak_log"],
});

describe("isResultSlot", () => {
  it("identifies result slots", () => {
    expect(isResultSlot("crafting.result")).toBe(true);
    expect(isResultSlot("cooking.result")).toBe(true);
    expect(isResultSlot("stonecutter.result")).toBe(true);
    expect(isResultSlot("smithing.result")).toBe(true);
  });

  it("rejects non-result slots", () => {
    expect(isResultSlot("crafting.1")).toBe(false);
    expect(isResultSlot("cooking.ingredient")).toBe(false);
  });
});

describe("recipe slot acceptance", () => {
  it("accepts items in result slots", () => {
    expect(canRecipeSlotAcceptIngredientItem("crafting.result", makeItem())).toBe(true);
    expect(canRecipeSlotAcceptSlotValue("crafting.result", toRecipeSlotValue(makeItem()))).toBe(
      true,
    );
  });

  it("rejects tags in result slots", () => {
    expect(canRecipeSlotAcceptIngredientItem("crafting.result", makeTagItem())).toBe(false);
    expect(canRecipeSlotAcceptSlotValue("crafting.result", toRecipeSlotValue(makeTagItem()))).toBe(
      false,
    );
  });

  it("accepts tags in ingredient slots", () => {
    expect(canRecipeSlotAcceptIngredientItem("crafting.1", makeTagItem())).toBe(true);
    expect(canRecipeSlotAcceptSlotValue("crafting.1", toRecipeSlotValue(makeTagItem()))).toBe(true);
  });
});

describe("isRecipeSlotDisabled", () => {
  it("disables 2x2 slots when twoByTwo is enabled", () => {
    const recipe = makeCanonicalRecipe({
      crafting: { shapeless: false, keepWhitespace: false, twoByTwo: true },
    });

    expect(isRecipeSlotDisabled(recipe, "crafting.3")).toBe(true);
    expect(isRecipeSlotDisabled(recipe, "crafting.6")).toBe(true);
    expect(isRecipeSlotDisabled(recipe, "crafting.7")).toBe(true);
    expect(isRecipeSlotDisabled(recipe, "crafting.8")).toBe(true);
    expect(isRecipeSlotDisabled(recipe, "crafting.9")).toBe(true);
  });

  it("does not disable any slots when twoByTwo is off", () => {
    const recipe = makeCanonicalRecipe();
    expect(isRecipeSlotDisabled(recipe, "crafting.3")).toBe(false);
  });

  it("does not disable slots for non-crafting recipes", () => {
    const recipe = makeCanonicalRecipe({ recipeType: RecipeType.Smelting });
    expect(isRecipeSlotDisabled(recipe, "crafting.3")).toBe(false);
  });
});

describe("findFirstEmptyRecipeSlot", () => {
  it("returns first empty crafting slot", () => {
    const recipe = makeCanonicalRecipe();
    expect(findFirstEmptyRecipeSlot(recipe, makeItem())).toBe("crafting.1");
  });

  it("skips occupied slots", () => {
    const recipe = makeCanonicalRecipe({
      slots: { "crafting.1": makeItem() },
    });
    expect(findFirstEmptyRecipeSlot(recipe, makeItem())).toBe("crafting.2");
  });

  it("skips disabled 2x2 slots", () => {
    const recipe = makeCanonicalRecipe({
      crafting: { shapeless: false, keepWhitespace: false, twoByTwo: true },
      slots: { "crafting.1": makeItem(), "crafting.2": makeItem() },
    });
    expect(findFirstEmptyRecipeSlot(recipe, makeItem())).toBe("crafting.4");
  });

  it("uses the 2x2 layout order before falling through to the result slot", () => {
    const recipe = makeCanonicalRecipe({
      crafting: { shapeless: false, keepWhitespace: false, twoByTwo: true },
      slots: {
        "crafting.1": makeItem(),
        "crafting.2": makeItem(),
        "crafting.4": makeItem(),
        "crafting.5": makeItem(),
      },
    });
    expect(findFirstEmptyRecipeSlot(recipe, makeItem())).toBe("crafting.result");
  });

  it("returns undefined when all slots are full", () => {
    const recipe = makeCanonicalRecipe({
      slots: Object.fromEntries(
        [
          "crafting.1",
          "crafting.2",
          "crafting.3",
          "crafting.4",
          "crafting.5",
          "crafting.6",
          "crafting.7",
          "crafting.8",
          "crafting.9",
          "crafting.result",
        ].map((s) => [s, makeItem()]),
      ),
    });
    expect(findFirstEmptyRecipeSlot(recipe, makeItem())).toBeUndefined();
  });

  it("does not place tags in result slots", () => {
    const recipe = makeCanonicalRecipe({
      recipeType: RecipeType.Smelting,
      slots: { "cooking.ingredient": makeItem() },
    });
    expect(findFirstEmptyRecipeSlot(recipe, makeTagItem())).toBeUndefined();
  });

  it("returns first cooking slot for smelting", () => {
    const recipe = makeCanonicalRecipe({ recipeType: RecipeType.Smelting });
    expect(findFirstEmptyRecipeSlot(recipe, makeItem())).toBe("cooking.ingredient");
  });
});

describe("canEditRecipeSlotCount", () => {
  it("allows count editing for crafting result", () => {
    expect(canEditRecipeSlotCount(RecipeType.Crafting, "crafting.result")).toBe(true);
  });

  it("allows count editing for stonecutter result", () => {
    expect(canEditRecipeSlotCount(RecipeType.Stonecutter, "stonecutter.result")).toBe(true);
  });

  it("disallows count editing for smelting result", () => {
    expect(canEditRecipeSlotCount(RecipeType.Smelting, "cooking.result")).toBe(false);
  });

  it("disallows count editing for non-result slots", () => {
    expect(canEditRecipeSlotCount(RecipeType.Crafting, "crafting.1")).toBe(false);
  });
});
