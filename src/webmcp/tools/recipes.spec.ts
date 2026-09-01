import { MinecraftVersion, RecipeType } from "@/data/types";
import { SLOTS } from "@/recipes/slots";
import { useCustomItemStore } from "@/stores/custom-item";
import { useRecipeStore } from "@/stores/recipe";
import { useSettingsStore } from "@/stores/settings";
import { useTagStore } from "@/stores/tag";
import { useUIStore } from "@/stores/ui";
import { itemSlot, makeRecipe } from "@/test/recipe-fixtures";
import { makeItem, seedResources } from "@/test/resource-fixtures";

import { RecipeSummary } from "../summary";
import { createRecipeTool, deleteRecipeTool, selectRecipeTool, updateRecipeTool } from "./recipes";

const stick = { namespace: "minecraft", id: "stick" };
const pickaxe = { namespace: "minecraft", id: "wooden_pickaxe" };

const items = [
  makeItem("stick"),
  makeItem("oak_planks"),
  makeItem("wooden_pickaxe"),
  makeItem("iron_ore"),
  makeItem("iron_ingot"),
];

const vanillaTags = { "minecraft:planks": ["minecraft:oak_planks"] };

const getSelected = () => {
  const { recipes, selectedRecipeId } = useRecipeStore.getState();
  return recipes.find((recipe) => recipe.id === selectedRecipeId);
};

beforeEach(() => {
  useSettingsStore.setState({
    minecraftVersion: MinecraftVersion.V121,
    bedrockNamespace: "crafting",
  });
  useRecipeStore.setState({ recipes: [makeRecipe({ id: "r1" })], selectedRecipeId: "r1" });
  useCustomItemStore.setState({ customItems: [] });
  useTagStore.setState({ tags: [] });
  useUIStore.setState({ selection: undefined, lastPlacedSlot: undefined });
  seedResources(MinecraftVersion.V121, items, vanillaTags);
});

describe("tool schemas", () => {
  it.each([createRecipeTool, selectRecipeTool, deleteRecipeTool, updateRecipeTool])(
    "$name exposes an object input schema",
    (tool) => {
      expect(tool.inputSchema?.type).toBe("object");
    },
  );
});

describe("create_recipe", () => {
  it("creates and selects a recipe with the given type and name", async () => {
    const summary = (await createRecipeTool.execute({
      recipeType: RecipeType.Smelting,
      name: "iron_from_ore",
    })) as RecipeSummary;

    const { recipes, selectedRecipeId } = useRecipeStore.getState();

    expect(recipes).toHaveLength(2);
    expect(selectedRecipeId).not.toBe("r1");
    expect(summary.id).toBe(selectedRecipeId);
    expect(summary.recipeType).toBe(RecipeType.Smelting);
    expect(summary.options).toMatchObject({ nameMode: "manual", name: "iron_from_ore" });
    expect(summary.warnings).toEqual([]);
  });

  it("creates a default crafting recipe with an auto name when no fields are given", async () => {
    const summary = (await createRecipeTool.execute({})) as RecipeSummary;

    expect(summary.recipeType).toBe(RecipeType.Crafting);
    expect(summary.options).toMatchObject({ nameMode: "auto" });
  });

  it("rejects recipe types unsupported by the current version", async () => {
    useSettingsStore.setState({ minecraftVersion: MinecraftVersion.V112 });
    seedResources(MinecraftVersion.V112, items);

    await expect(createRecipeTool.execute({ recipeType: RecipeType.Smelting })).rejects.toThrow(
      'Recipe type "smelting" is not supported in Java 1.12. Supported types: crafting',
    );
    expect(useRecipeStore.getState().recipes).toHaveLength(1);
  });
});

describe("select_recipe", () => {
  it("selects an existing recipe", async () => {
    useRecipeStore.setState({
      recipes: [
        makeRecipe({ id: "r1" }),
        makeRecipe({ id: "r2", recipeType: RecipeType.Smelting }),
      ],
      selectedRecipeId: "r1",
    });

    const summary = (await selectRecipeTool.execute({ recipeId: "r2" })) as RecipeSummary;

    expect(useRecipeStore.getState().selectedRecipeId).toBe("r2");
    expect(summary.id).toBe("r2");
    expect(summary.recipeType).toBe(RecipeType.Smelting);
  });

  it("rejects unknown ids", async () => {
    await expect(selectRecipeTool.execute({ recipeId: "nope" })).rejects.toThrow(
      'Unknown recipeId "nope". Call get_editor_state to list recipes.',
    );
    expect(useRecipeStore.getState().selectedRecipeId).toBe("r1");
  });
});

describe("delete_recipe", () => {
  it("refuses to delete the last recipe", async () => {
    await expect(deleteRecipeTool.execute({ recipeId: "r1" })).rejects.toThrow(
      "Cannot delete the last recipe; create another recipe first",
    );
    expect(useRecipeStore.getState().recipes).toHaveLength(1);
  });

  it("rejects unknown ids", async () => {
    useRecipeStore.setState({
      recipes: [makeRecipe({ id: "r1" }), makeRecipe({ id: "r2" })],
      selectedRecipeId: "r1",
    });

    await expect(deleteRecipeTool.execute({ recipeId: "nope" })).rejects.toThrow(
      'Unknown recipeId "nope"',
    );
    expect(useRecipeStore.getState().recipes).toHaveLength(2);
  });

  it("deletes the selected recipe and selects the next one", async () => {
    useRecipeStore.setState({
      recipes: [
        makeRecipe({ id: "r1", slots: { [SLOTS.crafting.result]: itemSlot(stick) } }),
        makeRecipe({ id: "r2", recipeType: RecipeType.Smelting }),
        makeRecipe({ id: "r3" }),
      ],
      selectedRecipeId: "r1",
    });

    const result = (await deleteRecipeTool.execute({ recipeId: "r1" })) as {
      deletedId: string;
      deletedTitle: string;
      selectedRecipe: RecipeSummary;
    };

    expect(result.deletedId).toBe("r1");
    expect(result.deletedTitle).toBe("stick");
    expect(result.selectedRecipe.id).toBe("r2");
    expect(useRecipeStore.getState().recipes.map((recipe) => recipe.id)).toEqual(["r2", "r3"]);
    expect(useRecipeStore.getState().selectedRecipeId).toBe("r2");
  });
});

describe("update_recipe", () => {
  it("rejects an empty update", async () => {
    await expect(updateRecipeTool.execute({})).rejects.toThrow("No fields provided");
  });

  it("changes the recipe type and clears slots outside the new layout", async () => {
    useRecipeStore.setState({
      recipes: [
        makeRecipe({
          id: "r1",
          slots: {
            [SLOTS.crafting.slot1]: itemSlot(stick),
            [SLOTS.crafting.result]: itemSlot(pickaxe),
          },
        }),
      ],
      selectedRecipeId: "r1",
    });

    const summary = (await updateRecipeTool.execute({
      recipeType: RecipeType.Smelting,
    })) as RecipeSummary;

    expect(summary.recipeType).toBe(RecipeType.Smelting);
    expect(summary.slots).toEqual({});
    expect(summary.warnings).toEqual([
      'Cleared slot "crafting.1" because it is not part of a Smelting recipe',
      'Cleared slot "crafting.result" because it is not part of a Smelting recipe',
    ]);
    expect(getSelected()?.slots).toEqual({
      [SLOTS.crafting.slot1]: undefined,
      [SLOTS.crafting.result]: undefined,
    });
  });

  it("rejects unsupported recipe types without changing anything", async () => {
    useSettingsStore.setState({ minecraftVersion: MinecraftVersion.V112 });
    seedResources(MinecraftVersion.V112, items);

    await expect(
      updateRecipeTool.execute({ recipeType: RecipeType.Smelting, group: "x" }),
    ).rejects.toThrow('Recipe type "smelting" is not supported in Java 1.12');
    expect(getSelected()).toMatchObject({ recipeType: RecipeType.Crafting, group: "" });
  });

  it("validates the category against the recipe type", async () => {
    await expect(updateRecipeTool.execute({ category: "food" })).rejects.toThrow(
      'Unknown category "food" for Crafting recipes. Options: equipment, building, misc, redstone',
    );
    expect(getSelected()?.category).toBe("");

    const summary = (await updateRecipeTool.execute({ category: "misc" })) as RecipeSummary;

    expect(summary.options.category).toBe("misc");
    expect(summary.warnings).toEqual([]);
  });

  it("validates the category against the new type when both change", async () => {
    const summary = (await updateRecipeTool.execute({
      recipeType: RecipeType.Smelting,
      category: "food",
    })) as RecipeSummary;

    expect(summary.recipeType).toBe(RecipeType.Smelting);
    expect(summary.options.category).toBe("food");
  });

  it("switches names between manual and auto", async () => {
    let summary = (await updateRecipeTool.execute({ name: "my_recipe" })) as RecipeSummary;

    expect(summary.options).toMatchObject({ nameMode: "manual", name: "my_recipe" });

    summary = (await updateRecipeTool.execute({ name: null })) as RecipeSummary;

    expect(summary.options).toMatchObject({ nameMode: "auto", name: "my_recipe" });
  });

  it("applies crafting, group and showNotification options", async () => {
    const summary = (await updateRecipeTool.execute({
      group: "tools",
      showNotification: false,
      crafting: { shapeless: true, keepWhitespace: true, twoByTwo: true },
    })) as RecipeSummary;

    expect(summary.options).toMatchObject({
      group: "tools",
      crafting: { shapeless: true, keepWhitespace: true, twoByTwo: true },
    });
    // shapeless show_notification requires 26.1+
    expect(summary.warnings).toEqual([
      "showNotification is ignored for Crafting recipes in Java 1.21",
    ]);
    expect(getSelected()?.showNotification).toBe(false);
  });

  it("warns about fields that do not apply but still stores them", async () => {
    const summary = (await updateRecipeTool.execute({
      cooking: { time: 100, experience: 0.5 },
      smithing: { trimPattern: "minecraft:sentry" },
      bedrock: { identifierName: "custom_id", priority: 2 },
    })) as RecipeSummary;

    expect(summary.warnings).toEqual([
      "cooking options are ignored for Crafting recipes",
      "smithing.trimPattern is ignored for Crafting recipes",
      "bedrock options are ignored in Java 1.21",
    ]);
    expect(getSelected()).toMatchObject({
      cooking: { time: 100, experience: 0.5 },
      smithing: { trimPattern: "minecraft:sentry" },
      bedrock: { identifierMode: "manual", identifierName: "custom_id", priority: 2 },
    });
  });

  it("warns when crafting options are set on a non-crafting recipe", async () => {
    useRecipeStore.setState({
      recipes: [makeRecipe({ id: "r1", recipeType: RecipeType.Smelting })],
      selectedRecipeId: "r1",
    });

    const summary = (await updateRecipeTool.execute({
      crafting: { shapeless: true },
      cooking: { time: null },
    })) as RecipeSummary;

    expect(summary.warnings).toEqual(["crafting options are ignored for Smelting recipes"]);
    expect(summary.options.cooking).toEqual({ time: null, experience: 0 });
  });

  it("warns when the category is not supported by the version", async () => {
    useSettingsStore.setState({ minecraftVersion: MinecraftVersion.V118 });
    seedResources(MinecraftVersion.V118, items, vanillaTags);

    const summary = (await updateRecipeTool.execute({ category: "misc" })) as RecipeSummary;

    expect(summary.warnings).toEqual(["category is ignored for Crafting recipes in Java 1.18.2"]);
    expect(getSelected()?.category).toBe("misc");
  });

  it("rejects twoByTwo on Bedrock", async () => {
    useSettingsStore.setState({ minecraftVersion: MinecraftVersion.Bedrock });
    seedResources(MinecraftVersion.Bedrock, items, vanillaTags);

    await expect(
      updateRecipeTool.execute({ crafting: { twoByTwo: true }, group: "x" }),
    ).rejects.toThrow("2x2 crafting is Java only");
    expect(getSelected()).toMatchObject({ group: "", crafting: { twoByTwo: false } });
  });

  it("switches the bedrock identifier back to auto with null", async () => {
    useSettingsStore.setState({ minecraftVersion: MinecraftVersion.Bedrock });
    seedResources(MinecraftVersion.Bedrock, items, vanillaTags);
    useRecipeStore.setState({
      recipes: [
        makeRecipe({ id: "r1", bedrock: { identifierMode: "manual", identifierName: "old" } }),
      ],
      selectedRecipeId: "r1",
    });

    const summary = (await updateRecipeTool.execute({
      bedrock: { identifierName: null },
    })) as RecipeSummary;

    expect(summary.warnings).toEqual([]);
    expect(summary.options.bedrock).toMatchObject({ identifierMode: "auto" });
  });
});
