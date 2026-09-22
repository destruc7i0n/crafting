import { beforeEach, expect, it, vi } from "vitest";

import { MinecraftVersion, RecipeType } from "@/data/types";
import { SLOTS } from "@/recipes/slots";
import { useRecipeStore } from "@/stores/recipe";
import { useUIStore } from "@/stores/ui";
import { makeRecipe } from "@/test/recipe-fixtures";

import type { RecipeState } from "@/stores/recipe/types";

import { useItemSelection } from "./use-item-selection";

const harness = vi.hoisted(() => ({
  touch: false,
  selector: (_state: RecipeState): unknown => undefined,
}));

vi.mock("./use-is-touch-device", () => ({ useIsTouchDevice: () => harness.touch }));
// replace only React subscription boundaries; mutations use the real Zustand stores
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
const arrow = (potion: string) => ({
  kind: "item" as const,
  id: { namespace: "minecraft", id: "tipped_arrow" },
  potion,
});

beforeEach(() => {
  harness.touch = false;
  const recipe = makeRecipe({ id: "selection-test", recipeType: RecipeType.Brewing });
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
  store.setRecipeSlot(SLOTS.brewing.result, arrow("minecraft:healing"));
  useUIStore.getState().selectSlot(SLOTS.brewing.result, arrow("minecraft:healing"));
  useItemSelection();
  const before = snapshot();
  store.setRecipeName("renamed");
  expect(snapshot()).toBe(before);
  store.setRecipeGroup("group");
  expect(snapshot()).toBe(before);
  store.setRecipeSlot(SLOTS.brewing.input, arrow("minecraft:water"));
  expect(snapshot()).toBe(before);

  store.setBrewingChoice({
    recipeId: "selection-test",
    recipeType: RecipeType.Brewing,
    slot: SLOTS.brewing.result,
    value: arrow("minecraft:poison"),
  });
  expect(snapshot()).not.toBe(before);
  expect(useItemSelection()).toMatchObject({ value: { potion: "minecraft:poison" } });
  const changedPotion = snapshot();
  store.setRecipeSlotCount(SLOTS.brewing.result, 8);
  expect(snapshot()).not.toBe(changedPotion);
  expect(useItemSelection()).toMatchObject({ value: { potion: "minecraft:poison", count: 8 } });
  store.setRecipeSlot(SLOTS.brewing.result, undefined);
  expect(snapshot()).toBeUndefined();
  expect(useItemSelection()).toBeUndefined();
});
