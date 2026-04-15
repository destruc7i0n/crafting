import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RecipeType } from "@/data/types";
import { SLOTS } from "@/recipes/slots";

import {
  normalizePersistedRecipeState,
  RECIPE_STORE_NAME,
  RECIPE_STORE_VERSION,
} from "./persistence";
import { recipeStateDefaults } from "./types";

const createStorage = (): Storage => {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => {
      values.delete(key);
    },
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
};

describe("recipe persistence", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it("hydrates missing nested recipe branches with defaults", () => {
    const state = normalizePersistedRecipeState({
      recipes: [
        {
          id: "recipe-1",
          nameMode: "manual",
          name: "stone_recipe",
          recipeType: RecipeType.Crafting,
          group: "building",
          category: "decorations",
          showNotification: false,
          smithing: {
            trimPattern: "minecraft:silence",
          },
          slots: {},
        },
      ],
      selectedRecipeId: "recipe-1",
    });

    expect(state).toEqual({
      recipes: [
        {
          ...recipeStateDefaults,
          id: "recipe-1",
          nameMode: "manual",
          name: "stone_recipe",
          recipeType: RecipeType.Crafting,
          group: "building",
          category: "decorations",
          showNotification: false,
          smithing: {
            trimPattern: "minecraft:silence",
          },
        },
      ],
      selectedRecipeId: "recipe-1",
    });
  });

  it("drops unknown slot keys and invalid slot kinds while preserving custom refs", () => {
    const state = normalizePersistedRecipeState({
      recipes: [
        {
          id: "recipe-1",
          slots: {
            [SLOTS.crafting.result]: { kind: "custom_item", uid: "custom-1", count: 4 },
            [SLOTS.crafting.slot1]: { kind: "custom_tag", uid: "tag-1" },
            [SLOTS.crafting.slot2]: { kind: "invalid_kind", uid: "bad" },
            "crafting.10": {
              kind: "item",
              id: { namespace: "minecraft", id: "stone" },
            },
          },
        },
      ],
      selectedRecipeId: "recipe-1",
    });

    expect(state.recipes[0]?.slots).toEqual({
      [SLOTS.crafting.result]: { kind: "custom_item", uid: "custom-1", count: 4 },
      [SLOTS.crafting.slot1]: { kind: "custom_tag", uid: "tag-1" },
    });
  });

  it("falls back to one default recipe when persisted recipes are empty or invalid", () => {
    const emptyState = normalizePersistedRecipeState({
      recipes: [],
      selectedRecipeId: "missing",
    });
    const invalidState = normalizePersistedRecipeState({
      recipes: "not-an-array",
      selectedRecipeId: "missing",
    });

    expect(emptyState.recipes).toHaveLength(1);
    expect(emptyState.selectedRecipeId).toBe(emptyState.recipes[0]?.id);
    expect(invalidState.recipes).toHaveLength(1);
    expect(invalidState.selectedRecipeId).toBe(invalidState.recipes[0]?.id);
  });

  it("falls back to the first recipe when persisted selectedRecipeId is invalid", () => {
    const state = normalizePersistedRecipeState({
      recipes: [{ id: "recipe-1" }, { id: "recipe-2" }],
      selectedRecipeId: "missing",
    });

    expect(state.selectedRecipeId).toBe("recipe-1");
  });

  it("rehydrates normalized recipe state from localStorage", async () => {
    const localStorage = createStorage();
    localStorage.setItem(
      RECIPE_STORE_NAME,
      JSON.stringify({
        state: {
          recipes: [
            {
              id: "persisted-recipe",
              recipeType: RecipeType.Crafting,
              smithing: {
                trimPattern: "minecraft:silence",
              },
              slots: {
                [SLOTS.crafting.result]: {
                  kind: "item",
                  id: { namespace: "minecraft", id: "stone" },
                },
                "crafting.invalid": {
                  kind: "item",
                  id: { namespace: "minecraft", id: "dirt" },
                },
              },
            },
          ],
          selectedRecipeId: "missing",
        },
        version: RECIPE_STORE_VERSION,
      }),
    );

    vi.stubGlobal("localStorage", localStorage);
    vi.stubGlobal("window", { localStorage });

    const { useRecipeStore } = await import("./index");

    await useRecipeStore.persist.rehydrate();

    expect(useRecipeStore.getState()).toMatchObject({
      recipes: [
        {
          ...recipeStateDefaults,
          id: "persisted-recipe",
          recipeType: RecipeType.Crafting,
          smithing: {
            trimPattern: "minecraft:silence",
          },
          slots: {
            [SLOTS.crafting.result]: {
              kind: "item",
              id: { namespace: "minecraft", id: "stone" },
            },
          },
        },
      ],
      selectedRecipeId: "persisted-recipe",
    });

    useRecipeStore.getState().setRecipeSmithingTrimPattern("minecraft:coast");

    const persisted = JSON.parse(localStorage.getItem(RECIPE_STORE_NAME) ?? "null");

    expect(persisted).toMatchObject({
      version: RECIPE_STORE_VERSION,
      state: {
        selectedRecipeId: "persisted-recipe",
        recipes: [
          {
            id: "persisted-recipe",
            smithing: {
              trimPattern: "minecraft:coast",
            },
            slots: {
              [SLOTS.crafting.result]: {
                kind: "item",
                id: { namespace: "minecraft", id: "stone" },
              },
            },
          },
        ],
      },
    });
    expect(persisted.state.recipes[0]).not.toHaveProperty("smithingTrimPattern");
    expect(persisted.state.recipes[0].slots).not.toHaveProperty("crafting.invalid");
  });

  it("ignores legacy smithingTrimPattern data without a migration", async () => {
    const localStorage = createStorage();
    localStorage.setItem(
      RECIPE_STORE_NAME,
      JSON.stringify({
        state: {
          recipes: [
            {
              id: "persisted-recipe",
              recipeType: RecipeType.SmithingTrim,
              smithingTrimPattern: "minecraft:bolt",
              slots: {},
            },
          ],
          selectedRecipeId: "persisted-recipe",
        },
        version: RECIPE_STORE_VERSION,
      }),
    );

    vi.stubGlobal("localStorage", localStorage);
    vi.stubGlobal("window", { localStorage });

    const { useRecipeStore } = await import("./index");

    await useRecipeStore.persist.rehydrate();

    expect(useRecipeStore.getState()).toMatchObject({
      recipes: [
        {
          ...recipeStateDefaults,
          id: "persisted-recipe",
          recipeType: RecipeType.SmithingTrim,
          smithing: {
            trimPattern: "",
          },
        },
      ],
      selectedRecipeId: "persisted-recipe",
    });
  });
});
