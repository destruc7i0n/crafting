import { beforeEach, describe, expect, it, vi } from "vitest";

import { RecipeType } from "@/data/types";
import { SLOTS, type RecipeSlot } from "@/recipes/slots";
import { useRecipeStore } from "@/stores/recipe";
import { useUIStore } from "@/stores/ui";
import { itemSlot, makeRecipe } from "@/test/recipe-fixtures";

import { useRecipeSlotSelectionHandler } from "./use-recipe-slot-selection-handler";

vi.mock("./use-is-touch-device", () => ({ useIsTouchDevice: () => true }));
vi.mock("@/lib/analytics", () => ({ trackRecipeStartedIfNeeded: vi.fn<() => void>() }));
// replace only React subscription boundaries, mutations use the real Zustand stores
vi.mock("@/stores/recipe", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/stores/recipe")>();
  return {
    ...original,
    useRecipeStore: Object.assign(
      (selector: (state: ReturnType<typeof original.useRecipeStore.getState>) => unknown) =>
        selector(original.useRecipeStore.getState()),
      original.useRecipeStore,
    ),
  };
});
vi.mock("@/stores/settings", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/stores/settings")>();
  return {
    ...original,
    useSettingsStore: Object.assign(
      (selector: (state: ReturnType<typeof original.useSettingsStore.getState>) => unknown) =>
        selector(original.useSettingsStore.getState()),
      original.useSettingsStore,
    ),
  };
});

const { slot1, slot2 } = SLOTS.crafting;
const stone = itemSlot({ namespace: "minecraft", id: "stone" });
const dirt = itemSlot({ namespace: "minecraft", id: "dirt" });
const granite = itemSlot({ namespace: "minecraft", id: "granite" });

const slots = () => useRecipeStore.getState().recipes[0].slots;
const tap = (slot: RecipeSlot) => useRecipeSlotSelectionHandler(slot)();

describe("touch slot selection", () => {
  beforeEach(() => {
    const recipe = makeRecipe({ id: "handler-test", recipeType: RecipeType.Crafting });
    useRecipeStore.setState({ recipes: [recipe], selectedRecipeId: recipe.id });
    useUIStore.getState().clearInteractionState();
  });

  it("moves the current source value instead of the selection snapshot", () => {
    useRecipeStore.getState().setRecipeSlot(slot1, stone);
    tap(slot1);
    useRecipeStore.getState().setRecipeSlotCount(slot1, 5);

    tap(slot2);

    expect(slots()[slot1]).toBeUndefined();
    expect(slots()[slot2]).toEqual({ ...stone, count: 5 });
    expect(useUIStore.getState().selection).toMatchObject({ type: "slot", slot: slot2 });
  });

  it("swaps using current values on both sides", () => {
    useRecipeStore.getState().setRecipeSlot(slot1, stone);
    useRecipeStore.getState().setRecipeSlot(slot2, dirt);
    tap(slot1);
    useRecipeStore.getState().setRecipeSlot(slot1, granite);

    tap(slot2);

    expect(slots()[slot1]).toEqual(dirt);
    expect(slots()[slot2]).toEqual(granite);
  });

  it("does nothing when the selected source slot was cleared", () => {
    useRecipeStore.getState().setRecipeSlot(slot1, stone);
    useRecipeStore.getState().setRecipeSlot(slot2, dirt);
    tap(slot1);
    useRecipeStore.getState().setRecipeSlot(slot1, undefined);

    tap(slot2);

    expect(slots()[slot1]).toBeUndefined();
    expect(slots()[slot2]).toEqual(dirt);
  });
});
