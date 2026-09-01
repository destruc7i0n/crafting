import { CustomItem, Tag } from "@/data/models/types";
import { MinecraftVersion, RecipeType } from "@/data/types";
import { createSlotContext } from "@/lib/slot-context";
import { SLOTS } from "@/recipes/slots";
import { useCustomItemStore } from "@/stores/custom-item";
import { useRecipeStore } from "@/stores/recipe";
import { Recipe, SlotContext } from "@/stores/recipe/types";
import { useResourcesStore } from "@/stores/resources";
import { useSettingsStore } from "@/stores/settings";
import { useTagStore } from "@/stores/tag";
import { customItemSlot, customTagSlot, itemSlot, makeRecipe } from "@/test/recipe-fixtures";
import { makeItem, makeResources, seedResources } from "@/test/resource-fixtures";

import { summarizeEditor, summarizeRecipe, summarizeSelectedRecipe } from "./summary";

const items = [
  makeItem("minecraft:stick", "Stick"),
  makeItem("minecraft:oak_planks", "Oak Planks"),
  makeItem("minecraft:wool:3", "Light Blue Wool"),
];

const vanillaTags = { "minecraft:planks": ["minecraft:oak_planks"] };

const rubyItem: CustomItem = {
  type: "custom_item",
  uid: "custom-ruby",
  id: { namespace: "mymod", id: "ruby" },
  displayName: "Ruby",
  texture: "",
  _version: MinecraftVersion.V121,
};

const gemsTag: Tag = {
  uid: "tag-gems",
  id: "crafting:gems",
  values: [{ type: "item", id: { namespace: "mymod", id: "ruby" } }],
};

const stick = { namespace: "minecraft", id: "stick" };
const oakPlanks = { namespace: "minecraft", id: "oak_planks" };

const makeContext = (version = MinecraftVersion.V121): SlotContext =>
  createSlotContext({
    version,
    resources: makeResources(items, vanillaTags),
    customItems: [rubyItem],
    tags: [gemsTag],
  });

const summarize = (recipe: Recipe, version = MinecraftVersion.V121, recipes = [recipe]) =>
  summarizeRecipe({
    recipe,
    recipes,
    slotContext: makeContext(version),
    bedrockNamespace: "crafting",
  });

const makeStickRecipe = (input: Parameters<typeof makeRecipe>[0] = {}) =>
  makeRecipe({
    recipeType: RecipeType.Crafting,
    slots: {
      [SLOTS.crafting.slot1]: itemSlot(oakPlanks),
      [SLOTS.crafting.slot4]: itemSlot(oakPlanks),
      [SLOTS.crafting.result]: itemSlot(stick, 4),
    },
    ...input,
  });

describe("summarizeRecipe", () => {
  it("summarizes a valid crafting recipe on Java", () => {
    const recipe = makeStickRecipe({ id: "recipe-stick" });
    const summary = summarize(recipe);

    expect(summary).toMatchObject({
      id: "recipe-stick",
      title: "Stick",
      recipeType: RecipeType.Crafting,
      valid: true,
      errors: [],
      warnings: [],
    });
    expect(summary.options).toEqual({
      nameMode: "auto",
      name: "",
      group: "",
      category: "",
      showNotification: true,
      crafting: { shapeless: false, keepWhitespace: false, twoByTwo: false },
    });
    expect(summary.slots).toEqual({
      "crafting.1": { ref: "minecraft:oak_planks", label: "Oak Planks" },
      "crafting.4": { ref: "minecraft:oak_planks", label: "Oak Planks" },
      "crafting.result": { ref: "minecraft:stick", label: "Stick", count: 4 },
    });
    expect(summary.slotLayout).toHaveLength(10);
  });

  it("reports validation errors and passes warnings through", () => {
    const summary = summarizeRecipe({
      recipe: makeRecipe({ recipeType: RecipeType.Crafting }),
      recipes: [],
      slotContext: makeContext(),
      bedrockNamespace: "crafting",
      warnings: ["Something to note"],
    });

    expect(summary.valid).toBe(false);
    expect(summary.errors).toEqual(["Add at least one crafting ingredient", "Add a result item"]);
    expect(summary.warnings).toEqual(["Something to note"]);
    expect(summary.title).toBe("Crafting Recipe");
  });

  it("de-duplicates titles across recipes", () => {
    const first = makeStickRecipe({ id: "first" });
    const second = makeStickRecipe({ id: "second" });

    expect(summarize(second, MinecraftVersion.V121, [first, second]).title).toBe("Stick (2)");
  });

  it("flags missing custom refs", () => {
    const recipe = makeRecipe({
      recipeType: RecipeType.Crafting,
      slots: {
        [SLOTS.crafting.slot1]: customTagSlot("gone-tag"),
        [SLOTS.crafting.slot2]: customItemSlot("custom-ruby", 2),
        [SLOTS.crafting.result]: customItemSlot("gone-item"),
      },
    });

    expect(summarize(recipe).slots).toEqual({
      "crafting.1": { ref: "custom_tag:gone-tag", label: "Missing custom tag", missing: true },
      "crafting.2": { ref: "mymod:ruby", label: "Ruby", count: 2 },
      "crafting.result": {
        ref: "custom_item:gone-item",
        label: "Missing custom item",
        missing: true,
      },
    });
  });

  it("omits Java-only options on Bedrock and includes bedrock options", () => {
    const summary = summarize(
      makeStickRecipe({ bedrock: { identifierMode: "manual", identifierName: "my_stick" } }),
      MinecraftVersion.Bedrock,
    );

    expect(summary.options).toEqual({
      nameMode: "auto",
      name: "",
      group: "",
      crafting: { shapeless: false, keepWhitespace: false },
      bedrock: { identifierMode: "manual", identifierName: "my_stick", priority: 0 },
    });
  });

  it("omits bedrock priority for types that do not support it", () => {
    const summary = summarize(
      makeRecipe({ recipeType: RecipeType.Smelting }),
      MinecraftVersion.Bedrock,
    );

    expect(summary.options.bedrock).toEqual({ identifierMode: "auto", identifierName: "" });
    expect(summary.options).not.toHaveProperty("crafting");
  });

  it("omits category and showNotification on Java 1.12", () => {
    const summary = summarize(makeStickRecipe(), MinecraftVersion.V112);

    expect(summary.options).toEqual({
      nameMode: "auto",
      name: "",
      group: "",
      crafting: { shapeless: false, keepWhitespace: false, twoByTwo: false },
    });
  });

  it("includes cooking options for cooking types", () => {
    const recipe = makeRecipe({
      recipeType: RecipeType.Smelting,
      cooking: { time: 100, experience: 0.5 },
    });

    expect(summarize(recipe, MinecraftVersion.V121).options).toEqual({
      nameMode: "auto",
      name: "",
      group: "",
      category: "",
      cooking: { time: 100, experience: 0.5 },
    });
    // 26.1+ adds show_notification to non-crafting types
    expect(summarize(recipe, MinecraftVersion.V261).options).toHaveProperty(
      "showNotification",
      true,
    );
  });

  it("only includes the trim pattern when the version supports it", () => {
    const recipe = makeRecipe({
      recipeType: RecipeType.SmithingTrim,
      smithing: { trimPattern: "minecraft:sentry" },
    });

    expect(summarize(recipe, MinecraftVersion.V1215).options.smithing).toEqual({
      trimPattern: "minecraft:sentry",
    });
    expect(summarize(recipe, MinecraftVersion.V121).options).not.toHaveProperty("smithing");
    expect(summarize(recipe, MinecraftVersion.V1215).slotLayout.map((entry) => entry.slot)).toEqual(
      ["smithing.template", "smithing.base", "smithing.addition"],
    );
  });
});

describe("store-backed summaries", () => {
  const recipes = [
    makeStickRecipe({ id: "recipe-stick" }),
    makeRecipe({ id: "recipe-empty", recipeType: RecipeType.Smelting }),
  ];

  beforeEach(() => {
    useSettingsStore.setState({
      minecraftVersion: MinecraftVersion.V121,
      bedrockNamespace: "mypack",
    });
    useResourcesStore.setState({
      [MinecraftVersion.V121]: undefined,
      [MinecraftVersion.Bedrock]: undefined,
    });
    useCustomItemStore.setState((state) => ({ ...state, customItems: [rubyItem] }));
    useTagStore.setState((state) => ({ ...state, tags: [gemsTag] }));
    useRecipeStore.setState((state) => ({
      ...state,
      recipes,
      selectedRecipeId: "recipe-stick",
    }));
  });

  it("summarizes the selected recipe", () => {
    seedResources(MinecraftVersion.V121, items, vanillaTags);

    const summary = summarizeSelectedRecipe(["warned"]);

    expect(summary.id).toBe("recipe-stick");
    expect(summary.title).toBe("Stick");
    expect(summary.valid).toBe(true);
    expect(summary.warnings).toEqual(["warned"]);
  });

  it("throws when no recipe is selected", () => {
    useRecipeStore.setState((state) => ({ ...state, selectedRecipeId: "missing" }));

    expect(() => summarizeSelectedRecipe()).toThrow("No recipe is selected");
    expect(() => summarizeEditor()).toThrow("No recipe is selected");
  });

  it("summarizes the editor on Java", () => {
    seedResources(MinecraftVersion.V121, items, vanillaTags);

    const summary = summarizeEditor();

    expect(summary).toMatchObject({
      version: MinecraftVersion.V121,
      versionLabel: "Java 1.21",
      bedrockNamespace: "mypack",
      resourcesLoaded: true,
      categoryOptions: ["equipment", "building", "misc", "redstone"],
      exportName: "stick.json",
    });
    expect(summary.supportedRecipeTypes).toContain(RecipeType.SmithingTransform);
    expect(summary.supportedRecipeTypes).not.toContain(RecipeType.BrewingMix);
    expect(summary.recipes).toEqual([
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
    expect(summary.selectedRecipe.id).toBe("recipe-stick");
  });

  it("reports unloaded resources and falls back to raw ids", () => {
    const summary = summarizeEditor();

    expect(summary.resourcesLoaded).toBe(false);
    expect(summary.selectedRecipe.slots["crafting.result"]).toEqual({
      ref: "minecraft:stick",
      label: "stick",
      count: 4,
    });
  });

  it("uses the bedrock identifier as the export name on Bedrock", () => {
    useSettingsStore.setState({ minecraftVersion: MinecraftVersion.Bedrock });
    seedResources(MinecraftVersion.Bedrock, items, vanillaTags);

    const summary = summarizeEditor();

    expect(summary.versionLabel).toBe("Bedrock");
    expect(summary.exportName).toBe("mypack:stick");
    expect(summary).not.toHaveProperty("categoryOptions");
    expect(summary.supportedRecipeTypes).not.toContain(RecipeType.Smithing);
  });
});
