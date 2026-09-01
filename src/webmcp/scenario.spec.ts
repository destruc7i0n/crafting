import { beforeEach, describe, expect, it } from "vitest";

import { MinecraftVersion, RecipeType } from "@/data/types";
import { useCustomItemStore } from "@/stores/custom-item";
import { useRecipeStore } from "@/stores/recipe";
import { useResourcesStore } from "@/stores/resources";
import { useSettingsStore } from "@/stores/settings";
import { useTagStore } from "@/stores/tag";
import { useUIStore } from "@/stores/ui";
import { makeRecipe } from "@/test/recipe-fixtures";
import { makeItem, seedResources } from "@/test/resource-fixtures";

import { editorTools } from "./tools";

import type { EditorSummary, RecipeSummary } from "./summary";

const tool = (name: string) => {
  const found = editorTools.find((candidate) => candidate.name === name);
  if (!found) throw new Error(`missing tool ${name}`);
  return found;
};

const call = <T>(name: string, input: unknown = {}) => tool(name).execute(input) as Promise<T>;

describe("webmcp agent scenario", () => {
  beforeEach(() => {
    useSettingsStore.setState({
      minecraftVersion: MinecraftVersion.V121,
      bedrockNamespace: "crafting",
    });
    useRecipeStore.setState({ recipes: [makeRecipe({ id: "r1" })], selectedRecipeId: "r1" });
    useCustomItemStore.setState({ customItems: [] });
    useTagStore.setState({ tags: [] });
    useUIStore.setState({ selection: undefined, lastPlacedSlot: undefined });
    useResourcesStore.setState({ [MinecraftVersion.V121]: undefined });
    seedResources(
      MinecraftVersion.V121,
      [makeItem("stick"), makeItem("oak_planks"), makeItem("wooden_pickaxe")],
      { "minecraft:planks": ["minecraft:oak_planks"] },
    );
  });

  it("orient, search, create, fill a pattern and read the JSON", async () => {
    const state = await call<EditorSummary>("get_editor_state");
    expect(state.version).toBe(MinecraftVersion.V121);
    expect(state.supportedRecipeTypes).toContain(RecipeType.Crafting);
    expect(state.selectedRecipe.id).toBe("r1");

    const search = await call<{ results: { ref: string }[] }>("search_items", {
      query: "plank",
    });
    expect(search.results.map((result) => result.ref)).toEqual(
      expect.arrayContaining(["minecraft:oak_planks", "#minecraft:planks"]),
    );

    const created = await call<RecipeSummary>("create_recipe", { name: "wooden_pickaxe" });
    expect(created.id).not.toBe("r1");
    expect(useRecipeStore.getState().selectedRecipeId).toBe(created.id);

    const filled = await call<RecipeSummary>("set_crafting_pattern", {
      pattern: ["###", " / ", " / "],
      key: { "#": "#minecraft:planks", "/": "stick" },
      result: "wooden_pickaxe",
    });
    expect(filled.valid).toBe(true);
    expect(filled.slots["crafting.1"]?.ref).toBe("#minecraft:planks");
    expect(filled.slots["crafting.5"]?.ref).toBe("minecraft:stick");
    expect(filled.slots["crafting.8"]?.ref).toBe("minecraft:stick");
    expect(filled.slots["crafting.result"]?.ref).toBe("minecraft:wooden_pickaxe");

    const output = await call<{ fileName?: string; json: Record<string, unknown>; valid: boolean }>(
      "get_recipe_json",
    );
    expect(output.valid).toBe(true);
    expect(output.fileName).toBe("wooden_pickaxe.json");
    expect(output.json).toMatchObject({
      type: "minecraft:crafting_shaped",
      pattern: ["###", " / ", " / "],
      key: { "#": { tag: "minecraft:planks" }, "/": { item: "minecraft:stick" } },
    });
  });

  it("explains unknown ingredients with suggestions instead of writing partial state", async () => {
    await expect(
      call("set_crafting_pattern", {
        pattern: ["#"],
        key: { "#": "oak_plank" },
        result: "wooden_pickaxe",
      }),
    ).rejects.toThrow(/Unknown ingredient "oak_plank".*oak_planks/);

    expect(useRecipeStore.getState().recipes[0]?.slots).toEqual({});
  });
});
