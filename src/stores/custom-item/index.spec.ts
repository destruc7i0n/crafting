import { beforeEach, describe, expect, it } from "vitest";

import { MinecraftVersion, RecipeType } from "@/data/types";
import { SLOTS } from "@/recipes/slots";
import { useRecipeStore } from "@/stores/recipe";

import { useCustomItemStore } from "./index";

describe("custom item store", () => {
  beforeEach(() => {
    useCustomItemStore.setState((state) => ({
      ...state,
      customItems: [],
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
        },
      ],
      selectedRecipeId: "recipe-1",
    }));
  });

  it("does not rewrite recipe slots when a custom item id changes", () => {
    useCustomItemStore.getState().addCustomItem({
      name: "Custom Bedrock Item",
      rawId: "mod:custom_item",
      texture: "",
      version: MinecraftVersion.Bedrock,
    });

    const customItem = useCustomItemStore.getState().customItems[0]!;

    useRecipeStore.getState().setRecipeSlot(SLOTS.crafting.result, {
      kind: "custom_item",
      uid: customItem.uid,
    });
    useCustomItemStore.getState().updateCustomItem(customItem.uid, {
      rawId: "mod:item-name/path",
    });

    expect(useCustomItemStore.getState().customItems[0]).toMatchObject({
      id: {
        namespace: "mod",
        id: "itemnamepath",
      },
    });
    expect(useRecipeStore.getState().recipes[0]?.slots[SLOTS.crafting.result]).toMatchObject({
      kind: "custom_item",
      uid: customItem.uid,
    });
  });
});
