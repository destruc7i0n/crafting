import { MinecraftVersion, RecipeType } from "@/data/types";
import { SLOTS } from "@/recipes/slots";
import { useCustomItemStore } from "@/stores/custom-item";
import { useRecipeStore } from "@/stores/recipe";
import { useResourcesStore } from "@/stores/resources";
import { useSettingsStore } from "@/stores/settings";
import { useTagStore } from "@/stores/tag";
import { itemSlot, makeRecipe } from "@/test/recipe-fixtures";
import { makeItem, seedResources } from "@/test/resource-fixtures";

import { getEditorStateTool } from "./editor-state";

const stick = { namespace: "minecraft", id: "stick" };
const oakPlanks = { namespace: "minecraft", id: "oak_planks" };

const items = [
  makeItem("minecraft:stick", "Stick"),
  makeItem("minecraft:oak_planks", "Oak Planks"),
  makeItem("minecraft:wooden_pickaxe", "Wooden Pickaxe"),
];

describe("get_editor_state", () => {
  beforeEach(() => {
    useSettingsStore.setState({
      minecraftVersion: MinecraftVersion.V121,
      bedrockNamespace: "crafting",
    });
    useRecipeStore.setState({
      recipes: [
        makeRecipe({
          id: "recipe-stick",
          recipeType: RecipeType.Crafting,
          slots: {
            [SLOTS.crafting.slot1]: itemSlot(oakPlanks),
            [SLOTS.crafting.slot4]: itemSlot(oakPlanks),
            [SLOTS.crafting.result]: itemSlot(stick, 4),
          },
        }),
        makeRecipe({ id: "recipe-empty", recipeType: RecipeType.Smelting }),
      ],
      selectedRecipeId: "recipe-stick",
    });
    useCustomItemStore.setState({ customItems: [] });
    useTagStore.setState({ tags: [] });
    seedResources(MinecraftVersion.V121, items, { "minecraft:planks": ["minecraft:oak_planks"] });
  });

  it("exposes an object input schema and read-only annotation", () => {
    expect(getEditorStateTool.name).toBe("get_editor_state");
    expect(getEditorStateTool.inputSchema?.type).toBe("object");
    expect(getEditorStateTool.annotations).toEqual({ readOnlyHint: true });
    expect(getEditorStateTool.description).toContain("crafting.result");
    expect(getEditorStateTool.description).toContain("#minecraft:planks");
  });

  it("returns the editor summary with the selected recipe in full", async () => {
    const result = (await getEditorStateTool.execute({})) as Record<string, unknown>;

    expect(result).toMatchObject({
      version: MinecraftVersion.V121,
      versionLabel: "Java 1.21",
      bedrockNamespace: "crafting",
      resourcesLoaded: true,
      exportName: "stick.json",
    });
    expect(result.supportedRecipeTypes).toContain(RecipeType.Crafting);
    expect(result.recipes).toEqual([
      {
        id: "recipe-stick",
        title: "Stick",
        recipeType: RecipeType.Crafting,
        selected: true,
        valid: true,
      },
      {
        id: "recipe-empty",
        title: "Smelting Recipe",
        recipeType: RecipeType.Smelting,
        selected: false,
        valid: false,
      },
    ]);
    expect(result.selectedRecipe).toMatchObject({
      id: "recipe-stick",
      valid: true,
      errors: [],
      slots: {
        "crafting.1": { ref: "minecraft:oak_planks", label: "Oak Planks" },
        "crafting.result": { ref: "minecraft:stick", label: "Stick", count: 4 },
      },
    });
  });

  it("loads resources for the current version before summarizing", async () => {
    useResourcesStore.setState({ [MinecraftVersion.V121]: undefined });

    const result = (await getEditorStateTool.execute({})) as { resourcesLoaded: boolean };

    expect(result.resourcesLoaded).toBe(true);
    expect(useResourcesStore.getState()[MinecraftVersion.V121]?.items.length).toBeGreaterThan(0);
  });

  it("fails when no recipe is selected", async () => {
    useRecipeStore.setState({ selectedRecipeId: "missing" });

    await expect(getEditorStateTool.execute({})).rejects.toThrow("No recipe is selected");
  });
});
