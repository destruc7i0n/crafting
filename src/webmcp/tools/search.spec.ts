import { CustomItem, Tag } from "@/data/models/types";
import { MinecraftVersion } from "@/data/types";
import { useCustomItemStore } from "@/stores/custom-item";
import { useRecipeStore } from "@/stores/recipe";
import { useSettingsStore } from "@/stores/settings";
import { useTagStore } from "@/stores/tag";
import { makeRecipe } from "@/test/recipe-fixtures";
import { makeItem, seedResources } from "@/test/resource-fixtures";

import { searchItemsTool } from "./search";

type SearchResult = {
  version: MinecraftVersion;
  results: { ref: string; kind: string; label: string; previewValues?: string[] }[];
};

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

const search = (input: Record<string, unknown>) =>
  searchItemsTool.execute(input) as Promise<SearchResult>;

describe("search_items", () => {
  beforeEach(() => {
    const recipe = makeRecipe({ id: "recipe-1" });

    useSettingsStore.setState({
      minecraftVersion: MinecraftVersion.V121,
      bedrockNamespace: "crafting",
    });
    useRecipeStore.setState({ recipes: [recipe], selectedRecipeId: recipe.id });
    useCustomItemStore.setState({ customItems: [rubyItem] });
    useTagStore.setState({ tags: [gemsTag] });
    seedResources(
      MinecraftVersion.V121,
      [
        makeItem("minecraft:stick", "Stick"),
        makeItem("minecraft:oak_planks", "Oak Planks"),
        makeItem("minecraft:wooden_pickaxe", "Wooden Pickaxe"),
      ],
      { "minecraft:planks": ["minecraft:oak_planks"] },
    );
  });

  it("exposes an object input schema with defaults", () => {
    expect(searchItemsTool.name).toBe("search_items");
    expect(searchItemsTool.inputSchema?.type).toBe("object");
    expect(searchItemsTool.inputSchema).toMatchObject({
      properties: { limit: { default: 20 } },
      required: ["query"],
    });
    expect(searchItemsTool.annotations).toEqual({ readOnlyHint: true });
  });

  it("finds vanilla items by name and returns usable refs", async () => {
    const { version, results } = await search({ query: "stick" });

    expect(version).toBe(MinecraftVersion.V121);
    expect(results[0]).toEqual({ ref: "minecraft:stick", kind: "item", label: "Stick" });
  });

  it("includes custom items and tags with preview values", async () => {
    const { results } = await search({ query: "" });
    const refs = results.map((result) => result.ref);

    expect(refs).toEqual(
      expect.arrayContaining(["mymod:ruby", "#minecraft:planks", "#crafting:gems"]),
    );
    expect(results.find((result) => result.ref === "#minecraft:planks")).toEqual({
      ref: "#minecraft:planks",
      kind: "vanilla_tag",
      label: "#minecraft:planks",
      previewValues: ["minecraft:oak_planks"],
    });
  });

  it("respects the kinds filter", async () => {
    const { results } = await search({ query: "", kinds: ["vanilla_tag", "custom_tag"] });

    expect(results.map((result) => result.kind)).toEqual(["vanilla_tag", "custom_tag"]);
  });

  it("respects the limit", async () => {
    const { results } = await search({ query: "", limit: 2 });

    expect(results).toHaveLength(2);
  });

  it("rejects out-of-range limits and unknown kinds", async () => {
    await expect(search({ query: "", limit: 0 })).rejects.toThrow("limit");
    await expect(search({ query: "", limit: 51 })).rejects.toThrow("limit");
    await expect(search({ query: "", kinds: ["block"] })).rejects.toThrow("kinds");
  });
});
