import { describe, expect, it } from "vitest";

import { MinecraftVersion, RecipeType } from "@/data/types";
import { SingleRecipeState } from "@/stores/recipe";

import {
  canEditRecipeSlotCount,
  canRecipeSlotAcceptIngredient,
  findFirstEmptyRecipeSlot,
  isRecipeSlotDisabled,
  isResultSlot,
} from "./recipe-slots";

const makeRecipe = (overrides: Partial<SingleRecipeState> = {}): SingleRecipeState => ({
  recipeType: RecipeType.Crafting,
  group: "",
  slots: {},
  crafting: { shapeless: false, keepWhitespace: false, twoByTwo: false },
  cooking: { time: 0, experience: 0 },
  ...overrides,
});

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

describe("canRecipeSlotAcceptIngredient", () => {
  it("accepts items in result slots", () => {
    expect(canRecipeSlotAcceptIngredient("crafting.result", makeItem())).toBe(true);
  });

  it("rejects tags in result slots", () => {
    expect(canRecipeSlotAcceptIngredient("crafting.result", makeTagItem())).toBe(false);
  });

  it("accepts tags in ingredient slots", () => {
    expect(canRecipeSlotAcceptIngredient("crafting.1", makeTagItem())).toBe(true);
  });
});

describe("isRecipeSlotDisabled", () => {
  it("disables 2x2 slots when twoByTwo is enabled", () => {
    const recipe = makeRecipe({
      crafting: { shapeless: false, keepWhitespace: false, twoByTwo: true },
    });

    expect(isRecipeSlotDisabled(recipe, "crafting.3")).toBe(true);
    expect(isRecipeSlotDisabled(recipe, "crafting.6")).toBe(true);
    expect(isRecipeSlotDisabled(recipe, "crafting.7")).toBe(true);
    expect(isRecipeSlotDisabled(recipe, "crafting.8")).toBe(true);
    expect(isRecipeSlotDisabled(recipe, "crafting.9")).toBe(true);
  });

  it("does not disable any slots when twoByTwo is off", () => {
    const recipe = makeRecipe();
    expect(isRecipeSlotDisabled(recipe, "crafting.3")).toBe(false);
  });

  it("does not disable slots for non-crafting recipes", () => {
    const recipe = makeRecipe({ recipeType: RecipeType.Smelting });
    expect(isRecipeSlotDisabled(recipe, "crafting.3")).toBe(false);
  });
});

describe("findFirstEmptyRecipeSlot", () => {
  it("returns first empty crafting slot", () => {
    const recipe = makeRecipe();
    expect(findFirstEmptyRecipeSlot(recipe, makeItem())).toBe("crafting.1");
  });

  it("skips occupied slots", () => {
    const recipe = makeRecipe({
      slots: { "crafting.1": makeItem() },
    });
    expect(findFirstEmptyRecipeSlot(recipe, makeItem())).toBe("crafting.2");
  });

  it("skips disabled 2x2 slots", () => {
    const recipe = makeRecipe({
      crafting: { shapeless: false, keepWhitespace: false, twoByTwo: true },
      slots: { "crafting.1": makeItem(), "crafting.2": makeItem() },
    });
    expect(findFirstEmptyRecipeSlot(recipe, makeItem())).toBe("crafting.4");
  });

  it("returns undefined when all slots are full", () => {
    const recipe = makeRecipe({
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
    const recipe = makeRecipe({
      recipeType: RecipeType.Smelting,
      slots: { "cooking.ingredient": makeItem() },
    });
    expect(findFirstEmptyRecipeSlot(recipe, makeTagItem())).toBeUndefined();
  });

  it("returns first cooking slot for smelting", () => {
    const recipe = makeRecipe({ recipeType: RecipeType.Smelting });
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
