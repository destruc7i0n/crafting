import { MinecraftVersion, RecipeType } from "@/data/types";
import { SLOTS } from "@/recipes/slots";
import { useCustomItemStore } from "@/stores/custom-item";
import { useRecipeStore } from "@/stores/recipe";
import { useSettingsStore } from "@/stores/settings";
import { useTagStore } from "@/stores/tag";
import { itemSlot, makeRecipe } from "@/test/recipe-fixtures";
import { makeItem, seedResources } from "@/test/resource-fixtures";

import { getRecipeJsonTool } from "./recipe-json";

type RecipeJsonResult = {
  recipeId: string;
  fileName?: string;
  json: Record<string, unknown>;
  valid: boolean;
  errors: string[];
};

const stick = { namespace: "minecraft", id: "stick" };
const oakPlanks = { namespace: "minecraft", id: "oak_planks" };

const makeStickRecipe = (input: Parameters<typeof makeRecipe>[0] = {}) =>
  makeRecipe({
    id: "recipe-stick",
    recipeType: RecipeType.Crafting,
    slots: {
      [SLOTS.crafting.slot1]: itemSlot(oakPlanks),
      [SLOTS.crafting.slot4]: itemSlot(oakPlanks),
      [SLOTS.crafting.result]: itemSlot(stick, 4),
    },
    ...input,
  });

const seedVersion = (version: MinecraftVersion) =>
  seedResources(
    version,
    [
      makeItem("minecraft:stick", "Stick", version),
      makeItem("minecraft:oak_planks", "Oak Planks", version),
      makeItem("minecraft:wooden_pickaxe", "Wooden Pickaxe", version),
    ],
    { "minecraft:planks": ["minecraft:oak_planks"] },
  );

const getJson = (input: Record<string, unknown> = {}) =>
  getRecipeJsonTool.execute(input) as Promise<RecipeJsonResult>;

describe("get_recipe_json", () => {
  beforeEach(() => {
    useSettingsStore.setState({
      minecraftVersion: MinecraftVersion.V121,
      bedrockNamespace: "crafting",
    });
    useRecipeStore.setState({
      recipes: [makeStickRecipe(), makeRecipe({ id: "recipe-empty" })],
      selectedRecipeId: "recipe-stick",
    });
    useCustomItemStore.setState({ customItems: [] });
    useTagStore.setState({ tags: [] });
    seedVersion(MinecraftVersion.V121);
    seedVersion(MinecraftVersion.Bedrock);
  });

  it("exposes an object input schema", () => {
    expect(getRecipeJsonTool.name).toBe("get_recipe_json");
    expect(getRecipeJsonTool.inputSchema?.type).toBe("object");
    expect(getRecipeJsonTool.annotations).toEqual({ readOnlyHint: true });
  });

  it("generates Java JSON for the selected recipe", async () => {
    const result = await getJson();

    expect(result.recipeId).toBe("recipe-stick");
    expect(result.fileName).toBe("stick.json");
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.json).toMatchObject({
      type: "minecraft:crafting_shaped",
      result: { id: "minecraft:stick", count: 4 },
    });
  });

  it("generates JSON for a specific recipe and reports validation errors", async () => {
    const result = await getJson({ recipeId: "recipe-empty" });

    expect(result.recipeId).toBe("recipe-empty");
    expect(result.json).toMatchObject({ type: "minecraft:crafting_shaped" });
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(["Add at least one crafting ingredient", "Add a result item"]);
  });

  it("rejects unknown recipe ids", async () => {
    await expect(getJson({ recipeId: "nope" })).rejects.toThrow(
      'Unknown recipeId "nope"; call get_editor_state',
    );
  });

  it("generates Bedrock JSON with the resolved identifier", async () => {
    useSettingsStore.setState({ minecraftVersion: MinecraftVersion.Bedrock });

    const result = await getJson();

    expect(result.fileName).toBe("crafting:stick");
    expect(result.json).toMatchObject({
      "minecraft:recipe_shaped": { description: { identifier: "crafting:stick" } },
    });
    expect(result.json).toHaveProperty("format_version");
    expect(result.valid).toBe(true);
  });

  it("fails for Bedrock recipes without an identifier", async () => {
    useSettingsStore.setState({ minecraftVersion: MinecraftVersion.Bedrock });
    useRecipeStore.setState({
      recipes: [makeStickRecipe({ bedrock: { identifierMode: "manual", identifierName: "" } })],
    });

    await expect(getJson()).rejects.toThrow("This Bedrock recipe has no identifier");
  });

  it("surfaces generator errors with the Output panel message", async () => {
    useSettingsStore.setState({ minecraftVersion: MinecraftVersion.V116 });
    seedVersion(MinecraftVersion.V116);
    useRecipeStore.setState({
      recipes: [makeStickRecipe({ recipeType: RecipeType.SmithingTransform })],
    });

    await expect(getJson()).rejects.toThrow(
      'Recipe type "smithing_transform" is not available in Java 1.16.5',
    );
  });
});
