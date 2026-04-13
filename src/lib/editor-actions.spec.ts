import { beforeEach, describe, expect, it } from "vitest";

import { MinecraftVersion, RecipeType } from "@/data/types";
import { SLOTS } from "@/recipes/slots";
import { useCustomItemStore } from "@/stores/custom-item";
import { useRecipeStore } from "@/stores/recipe";
import { useTagStore } from "@/stores/tag";

import { deleteCustomItemAndClearRecipeRefs, deleteTagAndClearRecipeRefs } from "./editor-actions";

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
      recipes: [
        {
          id: "recipe-1",
          nameMode: "auto",
          name: "",
          recipeType: RecipeType.Crafting,
          group: "",
          category: "",
          showNotification: true,
          smithingTrimPattern: "",
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
        },
        {
          id: "recipe-2",
          nameMode: "auto",
          name: "",
          recipeType: RecipeType.Crafting,
          group: "",
          category: "",
          showNotification: true,
          smithingTrimPattern: "",
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
        },
      ],
      selectedRecipeId: "recipe-1",
    }));
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
});
