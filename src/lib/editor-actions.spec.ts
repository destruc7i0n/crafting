import { beforeEach, describe, expect, it } from "vitest";

import { IngredientItem } from "@/data/models/types";
import { MinecraftVersion, RecipeType } from "@/data/types";
import { SLOTS } from "@/recipes/slots";
import { useCustomItemStore } from "@/stores/custom-item";
import { useRecipeStore } from "@/stores/recipe";
import { useTagStore } from "@/stores/tag";
import { useUIStore } from "@/stores/ui";

import {
  createRecipeAndClearInteraction,
  deleteCustomItemAndClearRecipeRefs,
  deleteRecipeAndClearInteraction,
  deleteTagAndClearRecipeRefs,
  selectRecipeAndClearInteraction,
} from "./editor-actions";

const createRecipe = (id: string) => ({
  id,
  nameMode: "auto" as const,
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
    identifierMode: "auto" as const,
    identifierName: "",
    priority: 0,
  },
});

const ingredientItem: IngredientItem = {
  type: "default_item",
  id: { namespace: "minecraft", id: "stone" },
  displayName: "Stone",
  texture: "stone.png",
  _version: MinecraftVersion.V121,
};

const setIngredientInteractionState = () => {
  useUIStore.setState({
    selection: { type: "ingredient", item: ingredientItem },
    lastPlacedSlot: SLOTS.crafting.slot1,
  });
};

describe("editor actions", () => {
  beforeEach(() => {
    useCustomItemStore.setState((state) => ({
      ...state,
      customItems: [],
    }));

    useTagStore.setState((state) => ({
      ...state,
      tags: [],
    }));

    useRecipeStore.setState((state) => ({
      ...state,
      recipes: [createRecipe("recipe-1"), createRecipe("recipe-2")],
      selectedRecipeId: "recipe-1",
    }));

    useUIStore.setState({
      isMobileRecipeSidebarOpen: false,
      isRecipeSidebarExpanded: true,
      selection: undefined,
      lastPlacedSlot: undefined,
    });
  });

  it("deletes a custom item and clears matching recipe refs in all recipes", () => {
    useCustomItemStore.getState().addCustomItem({
      name: "Custom Item",
      rawId: "crafting:custom_item",
      texture: "",
      version: MinecraftVersion.V121,
    });

    const customItem = useCustomItemStore.getState().customItems[0]!;

    useRecipeStore.setState((state) => ({
      ...state,
      recipes: state.recipes.map((recipe) => ({
        ...recipe,
        slots: {
          ...recipe.slots,
          [SLOTS.crafting.result]: {
            kind: "custom_item",
            uid: customItem.uid,
          },
        },
      })),
    }));

    deleteCustomItemAndClearRecipeRefs(customItem.uid);

    expect(useCustomItemStore.getState().customItems).toEqual([]);
    expect(useRecipeStore.getState().recipes[0]?.slots[SLOTS.crafting.result]).toBeUndefined();
    expect(useRecipeStore.getState().recipes[1]?.slots[SLOTS.crafting.result]).toBeUndefined();
  });

  it("deletes a tag and clears matching recipe refs in all recipes", () => {
    const tag = {
      uid: "tag-1",
      id: "crafting:tag",
      values: [],
    };

    useTagStore.setState((state) => ({
      ...state,
      tags: [tag],
    }));

    useRecipeStore.setState((state) => ({
      ...state,
      recipes: state.recipes.map((recipe) => ({
        ...recipe,
        slots: {
          ...recipe.slots,
          [SLOTS.crafting.slot1]: {
            kind: "custom_tag",
            uid: tag.uid,
          },
        },
      })),
    }));

    deleteTagAndClearRecipeRefs(tag.uid);

    expect(useTagStore.getState().tags).toEqual([]);
    expect(useRecipeStore.getState().recipes[0]?.slots[SLOTS.crafting.slot1]).toBeUndefined();
    expect(useRecipeStore.getState().recipes[1]?.slots[SLOTS.crafting.slot1]).toBeUndefined();
  });

  it("clears interaction state when switching to a different recipe", () => {
    setIngredientInteractionState();

    selectRecipeAndClearInteraction("recipe-2");

    expect(useRecipeStore.getState().selectedRecipeId).toBe("recipe-2");
    expect(useUIStore.getState().selection).toBeUndefined();
    expect(useUIStore.getState().lastPlacedSlot).toBeUndefined();
  });

  it("preserves interaction state when selecting the active recipe", () => {
    setIngredientInteractionState();

    selectRecipeAndClearInteraction("recipe-1");

    expect(useRecipeStore.getState().selectedRecipeId).toBe("recipe-1");
    expect(useUIStore.getState().selection).toEqual({
      type: "ingredient",
      item: ingredientItem,
    });
    expect(useUIStore.getState().lastPlacedSlot).toBe(SLOTS.crafting.slot1);
  });

  it("clears interaction state and selects the new recipe when creating a recipe", () => {
    setIngredientInteractionState();

    createRecipeAndClearInteraction();

    const recipeState = useRecipeStore.getState();
    expect(recipeState.recipes).toHaveLength(3);
    expect(recipeState.selectedRecipeId).toBe(recipeState.recipes[2]?.id);
    expect(useUIStore.getState().selection).toBeUndefined();
    expect(useUIStore.getState().lastPlacedSlot).toBeUndefined();
  });

  it("clears interaction state when deleting the selected recipe", () => {
    setIngredientInteractionState();

    deleteRecipeAndClearInteraction("recipe-1");

    expect(useRecipeStore.getState().recipes).toHaveLength(1);
    expect(useRecipeStore.getState().selectedRecipeId).toBe("recipe-2");
    expect(useUIStore.getState().selection).toBeUndefined();
    expect(useUIStore.getState().lastPlacedSlot).toBeUndefined();
  });

  it("preserves interaction state when deleting a non-selected recipe", () => {
    setIngredientInteractionState();

    deleteRecipeAndClearInteraction("recipe-2");

    expect(useRecipeStore.getState().recipes).toHaveLength(1);
    expect(useRecipeStore.getState().selectedRecipeId).toBe("recipe-1");
    expect(useUIStore.getState().selection).toEqual({
      type: "ingredient",
      item: ingredientItem,
    });
    expect(useUIStore.getState().lastPlacedSlot).toBe(SLOTS.crafting.slot1);
  });

  it("preserves interaction state when deleting the final remaining recipe", () => {
    useRecipeStore.setState((state) => ({
      ...state,
      recipes: [createRecipe("recipe-1")],
      selectedRecipeId: "recipe-1",
    }));
    setIngredientInteractionState();

    deleteRecipeAndClearInteraction("recipe-1");

    expect(useRecipeStore.getState().recipes).toHaveLength(1);
    expect(useRecipeStore.getState().selectedRecipeId).toBe("recipe-1");
    expect(useUIStore.getState().selection).toEqual({
      type: "ingredient",
      item: ingredientItem,
    });
    expect(useUIStore.getState().lastPlacedSlot).toBe(SLOTS.crafting.slot1);
  });
});
