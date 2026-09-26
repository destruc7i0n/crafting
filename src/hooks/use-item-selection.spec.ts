import { beforeEach, expect, it, vi } from "vitest";

import { MinecraftVersion, RecipeType } from "@/data/types";
import { SLOTS } from "@/recipes/slots";
import { useRecipeStore } from "@/stores/recipe";
import { useUIStore } from "@/stores/ui";
import { itemSlot, makeRecipe } from "@/test/recipe-fixtures";

import type { RecipeState } from "@/stores/recipe/types";

import { useIngredientSelection, useItemSelection } from "./use-item-selection";

const harness = vi.hoisted(() => ({
  touch: false,
  selector: (_state: RecipeState): unknown => undefined,
}));

vi.mock("./use-is-touch-device", () => ({ useIsTouchDevice: () => harness.touch }));
// replace only React subscription boundaries, mutations use the real Zustand stores
vi.mock("@/stores/recipe", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/stores/recipe")>();
  return {
    ...original,
    useRecipeStore: Object.assign((selector: (state: RecipeState) => unknown) => {
      harness.selector = selector;
      return selector(original.useRecipeStore.getState());
    }, original.useRecipeStore),
  };
});
vi.mock("@/stores/ui", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/stores/ui")>();
  return {
    ...original,
    useUIStore: Object.assign(
      (selector: (state: ReturnType<typeof original.useUIStore.getState>) => unknown) =>
        selector(original.useUIStore.getState()),
      original.useUIStore,
    ),
  };
});

const snapshot = () => harness.selector(useRecipeStore.getState());
const stone = itemSlot({ namespace: "minecraft", id: "stone" });
const dirt = itemSlot({ namespace: "minecraft", id: "dirt" });

beforeEach(() => {
  harness.touch = false;
  const recipe = makeRecipe({ id: "selection-test", recipeType: RecipeType.Crafting });
  useRecipeStore.setState({ recipes: [recipe], selectedRecipeId: recipe.id });
  useUIStore.getState().clearInteractionState();
});

it("ignores recipe edits for desktop and ingredient selections", () => {
  for (const touch of [false, true]) {
    harness.touch = touch;
    useUIStore.getState().selectIngredient({
      type: "default_item",
      id: { namespace: "minecraft", id: "stone" },
      displayName: "Stone",
      texture: "",
      _version: MinecraftVersion.V263,
    });
    const selection = useItemSelection();
    const before = snapshot();
    useRecipeStore.getState().setRecipeName(`name-${touch}`);
    expect(snapshot()).toBe(before);
    useRecipeStore.getState().setRecipeGroup(`group-${touch}`);
    expect(snapshot()).toBe(before);
    expect(snapshot()).toBeUndefined();
    expect(useItemSelection()).toBe(selection);
  }
});

it("tracks only the selected touch slot through edits and clearing", () => {
  harness.touch = true;
  const store = useRecipeStore.getState();
  store.setRecipeSlot(SLOTS.crafting.slot1, stone);
  useUIStore.getState().selectSlot(SLOTS.crafting.slot1, stone);
  useItemSelection();
  const before = snapshot();
  store.setRecipeName("renamed");
  expect(snapshot()).toBe(before);
  store.setRecipeGroup("group");
  expect(snapshot()).toBe(before);
  store.setRecipeSlot(SLOTS.crafting.slot2, dirt);
  expect(snapshot()).toBe(before);

  store.setRecipeSlotCount(SLOTS.crafting.slot1, 8);
  expect(snapshot()).not.toBe(before);
  expect(useItemSelection()).toMatchObject({ value: { id: { id: "stone" }, count: 8 } });
  store.setRecipeSlot(SLOTS.crafting.slot1, undefined);
  expect(snapshot()).toBeUndefined();
  expect(useItemSelection()).toBeUndefined();
});

it("exposes only touch ingredient selections to ingredient list items", () => {
  const ingredient = {
    type: "default_item" as const,
    id: { namespace: "minecraft", id: "stone" },
    displayName: "Stone",
    texture: "",
    _version: MinecraftVersion.V263,
  };
  useUIStore.getState().selectIngredient(ingredient);
  expect(useIngredientSelection()).toBeUndefined();

  harness.touch = true;
  expect(useIngredientSelection()).toMatchObject({ type: "ingredient", item: ingredient });
  useRecipeStore.getState().setRecipeSlot(SLOTS.crafting.slot1, stone);
  useUIStore.getState().selectSlot(SLOTS.crafting.slot1, stone);
  expect(useIngredientSelection()).toBeUndefined();
});
