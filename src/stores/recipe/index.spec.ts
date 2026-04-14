import { beforeEach, describe, expect, it } from "vitest";

import { IngredientItem } from "@/data/models/types";
import { MinecraftVersion, RecipeType } from "@/data/types";
import { SLOTS } from "@/recipes/slots";

import { useRecipeStore } from "./index";
import { Recipe, RecipeSlotValue } from "./types";

const createRecipe = (id: string): Recipe => ({
  id,
  nameMode: "auto",
  name: "",
  recipeType: RecipeType.Crafting,
  group: "",
  category: "",
  showNotification: true,
  smithing: {
    trimPattern: "",
  },
  slots: {},
  crafting: {
    shapeless: false,
    keepWhitespace: false,
    twoByTwo: false,
  },
  cooking: {
    time: 0,
    experience: 0,
  },
  bedrock: {
    identifierMode: "auto",
    identifierName: "",
    priority: 0,
  },
});

const createDefaultItem = (id: string, count?: number): IngredientItem => ({
  type: "default_item",
  id: { namespace: "minecraft", id },
  displayName: id,
  texture: `${id}.png`,
  _version: MinecraftVersion.V121,
  ...(count !== undefined ? { count } : {}),
});

const createCustomSlotValue = (uid: string, count?: number): RecipeSlotValue => ({
  kind: "custom_item",
  uid,
  ...(count !== undefined ? { count } : {}),
});

describe("recipe store", () => {
  beforeEach(() => {
    useRecipeStore.setState((state) => ({
      ...state,
      recipes: [createRecipe("recipe_1")],
      selectedRecipeId: "recipe_1",
    }));
  });

  it("keeps the same selected recipe id when deleting an earlier recipe", () => {
    useRecipeStore.setState((state) => ({
      ...state,
      recipes: [createRecipe("recipe_1"), createRecipe("recipe_2"), createRecipe("recipe_3")],
      selectedRecipeId: "recipe_3",
    }));

    useRecipeStore.getState().deleteRecipe("recipe_1");

    expect(useRecipeStore.getState().selectedRecipeId).toBe("recipe_3");
  });

  it("selects the next recipe when deleting the selected one", () => {
    useRecipeStore.setState((state) => ({
      ...state,
      recipes: [createRecipe("recipe_1"), createRecipe("recipe_2"), createRecipe("recipe_3")],
      selectedRecipeId: "recipe_2",
    }));

    useRecipeStore.getState().deleteRecipe("recipe_2");

    expect(useRecipeStore.getState().selectedRecipeId).toBe("recipe_3");
    expect(useRecipeStore.getState().recipes[1]?.id).toBe("recipe_3");
  });

  it("falls back to the previous recipe when deleting the last selected recipe", () => {
    useRecipeStore.setState((state) => ({
      ...state,
      recipes: [createRecipe("recipe_1"), createRecipe("recipe_2"), createRecipe("recipe_3")],
      selectedRecipeId: "recipe_3",
    }));

    useRecipeStore.getState().deleteRecipe("recipe_3");

    expect(useRecipeStore.getState().selectedRecipeId).toBe("recipe_2");
    expect(useRecipeStore.getState().recipes[1]?.id).toBe("recipe_2");
  });

  it("keeps the final recipe when deleteRecipe is called with only one recipe left", () => {
    useRecipeStore.getState().deleteRecipe("recipe_1");

    expect(useRecipeStore.getState().selectedRecipeId).toBe("recipe_1");
    expect(useRecipeStore.getState().recipes).toHaveLength(1);
  });

  it("creates recipe state with independent nested settings objects", () => {
    useRecipeStore.getState().createRecipe();
    useRecipeStore.getState().setRecipeCraftingShapeless(true);

    expect(useRecipeStore.getState().recipes[0]?.crafting.shapeless).toBe(false);
    expect(useRecipeStore.getState().recipes[1]?.crafting.shapeless).toBe(true);
  });

  it("clears only the selected recipe slots and preserves its other fields", () => {
    const firstRecipe = createRecipe("recipe_1");
    firstRecipe.slots = {
      [SLOTS.crafting.slot1]: { kind: "item", id: { namespace: "minecraft", id: "oak_log" } },
    };

    const secondRecipe = createRecipe("recipe_2");
    secondRecipe.nameMode = "manual";
    secondRecipe.name = "polished_stone";
    secondRecipe.group = "building";
    secondRecipe.category = "decorations";
    secondRecipe.crafting = {
      shapeless: true,
      keepWhitespace: true,
      twoByTwo: true,
    };
    secondRecipe.cooking = {
      time: 200,
      experience: 0.35,
    };
    secondRecipe.bedrock = {
      identifierMode: "manual",
      identifierName: "stone_recipe",
      priority: 3,
    };
    secondRecipe.slots = {
      [SLOTS.crafting.slot1]: { kind: "item", id: { namespace: "minecraft", id: "stone" } },
      [SLOTS.crafting.result]: {
        kind: "item",
        id: { namespace: "minecraft", id: "polished_andesite" },
      },
    };

    useRecipeStore.setState((state) => ({
      ...state,
      recipes: [firstRecipe, secondRecipe],
      selectedRecipeId: "recipe_2",
    }));

    useRecipeStore.getState().clearSelectedRecipeSlots();

    expect(useRecipeStore.getState().recipes[0]?.slots).toEqual({
      [SLOTS.crafting.slot1]: {
        kind: "item",
        id: { namespace: "minecraft", id: "oak_log" },
      },
    });
    expect(useRecipeStore.getState().recipes[1]).toMatchObject({
      id: "recipe_2",
      nameMode: "manual",
      name: "polished_stone",
      group: "building",
      category: "decorations",
      smithing: {
        trimPattern: "",
      },
      crafting: {
        shapeless: true,
        keepWhitespace: true,
        twoByTwo: true,
      },
      cooking: {
        time: 200,
        experience: 0.35,
      },
      bedrock: {
        identifierMode: "manual",
        identifierName: "stone_recipe",
        priority: 3,
      },
      slots: {},
    });
  });

  it("stores canonical slot refs when setting an ingredient", () => {
    useRecipeStore
      .getState()
      .setRecipeSlotFromIngredient(SLOTS.crafting.result, createDefaultItem("stone_button", 4));

    expect(useRecipeStore.getState().recipes[0]?.slots[SLOTS.crafting.result]).toEqual({
      kind: "item",
      id: { namespace: "minecraft", id: "stone_button" },
      count: 4,
    });
  });

  it("updates counts only for item-like slot refs", () => {
    useRecipeStore.setState((state) => ({
      ...state,
      recipes: [
        {
          ...createRecipe("recipe_1"),
          slots: {
            [SLOTS.crafting.result]: createCustomSlotValue("custom-1", 2),
            [SLOTS.crafting.slot1]: {
              kind: "vanilla_tag",
              id: { namespace: "minecraft", id: "logs" },
            },
          },
        },
      ],
      selectedRecipeId: "recipe_1",
    }));

    useRecipeStore.getState().setRecipeSlotCount(SLOTS.crafting.result, 5);
    useRecipeStore.getState().setRecipeSlotCount(SLOTS.crafting.slot1, 9);

    expect(useRecipeStore.getState().recipes[0]?.slots[SLOTS.crafting.result]).toEqual({
      kind: "custom_item",
      uid: "custom-1",
      count: 5,
    });
    expect(useRecipeStore.getState().recipes[0]?.slots[SLOTS.crafting.slot1]).toEqual({
      kind: "vanilla_tag",
      id: { namespace: "minecraft", id: "logs" },
    });
  });

  it("removes all matching slot refs", () => {
    const firstRecipe = createRecipe("recipe_1");
    firstRecipe.slots = {
      [SLOTS.crafting.slot1]: { kind: "custom_item", uid: "custom-1" },
      [SLOTS.crafting.result]: { kind: "item", id: { namespace: "minecraft", id: "granite" } },
    };

    const secondRecipe = createRecipe("recipe_2");
    secondRecipe.slots = {
      [SLOTS.crafting.slot1]: { kind: "custom_item", uid: "custom-1" },
      [SLOTS.crafting.result]: { kind: "item", id: { namespace: "minecraft", id: "diorite" } },
    };

    useRecipeStore.setState((state) => ({
      ...state,
      recipes: [firstRecipe, secondRecipe],
      selectedRecipeId: "recipe_1",
    }));

    useRecipeStore
      .getState()
      .removeMatchingSlotValues(
        (value) => value.kind === "custom_item" && value.uid === "custom-1",
      );

    expect(useRecipeStore.getState().recipes[0]?.slots[SLOTS.crafting.slot1]).toBeUndefined();
    expect(useRecipeStore.getState().recipes[1]?.slots[SLOTS.crafting.slot1]).toBeUndefined();
    expect(useRecipeStore.getState().recipes[0]?.slots[SLOTS.crafting.result]).toEqual({
      kind: "item",
      id: { namespace: "minecraft", id: "granite" },
    });
  });
});
