import { MinecraftVersion } from "@/data/types";
import { getSlotContext } from "@/lib/slot-context";
import { useCustomItemStore } from "@/stores/custom-item";
import { useRecipeStore } from "@/stores/recipe";
import { useSettingsStore } from "@/stores/settings";
import { useTagStore } from "@/stores/tag";
import { makeRecipe } from "@/test/recipe-fixtures";
import { makeItem, seedResources } from "@/test/resource-fixtures";

import { resolveIngredientRef } from "../ingredient-ref";
import { createCustomItemTool } from "./custom-items";

type CreateResult = { uid: string; ref: string; displayName: string };

const create = (input: Record<string, unknown>) =>
  createCustomItemTool.execute(input) as Promise<CreateResult>;

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

describe("create_custom_item", () => {
  beforeEach(() => {
    const recipe = makeRecipe({ id: "recipe-1" });

    useSettingsStore.setState({
      minecraftVersion: MinecraftVersion.V121,
      bedrockNamespace: "crafting",
    });
    useRecipeStore.setState({ recipes: [recipe], selectedRecipeId: recipe.id });
    useCustomItemStore.setState({ customItems: [] });
    useTagStore.setState({ tags: [] });
    seedVersion(MinecraftVersion.V121);
    seedVersion(MinecraftVersion.Bedrock);
  });

  it("exposes an object input schema", () => {
    expect(createCustomItemTool.name).toBe("create_custom_item");
    expect(createCustomItemTool.inputSchema?.type).toBe("object");
    expect(createCustomItemTool.inputSchema).toMatchObject({
      required: ["id", "displayName"],
    });
    expect(createCustomItemTool.annotations).toBeUndefined();
  });

  it("creates a custom item and returns a resolvable ref", async () => {
    const result = await create({ id: "mymod:ruby", displayName: "Ruby" });

    expect(result).toEqual({ uid: expect.any(String), ref: "mymod:ruby", displayName: "Ruby" });

    const { customItems } = useCustomItemStore.getState();
    expect(customItems).toHaveLength(1);
    expect(customItems[0]).toMatchObject({
      uid: result.uid,
      id: { namespace: "mymod", id: "ruby" },
      displayName: "Ruby",
      _version: MinecraftVersion.V121,
    });
    expect(customItems[0].texture.length).toBeGreaterThan(0);

    expect(resolveIngredientRef({ ref: result.ref, slotContext: getSlotContext() })).toEqual({
      kind: "custom_item",
      uid: result.uid,
    });
  });

  it("stores the provided texture", async () => {
    const texture = "data:image/png;base64,AAAA";

    await create({ id: "mymod:ruby", displayName: "Ruby", texture });

    expect(useCustomItemStore.getState().customItems[0].texture).toBe(texture);
  });

  it("rejects duplicate ids", async () => {
    await create({ id: "mymod:ruby", displayName: "Ruby" });

    await expect(create({ id: "mymod:ruby", displayName: "Another Ruby" })).rejects.toThrow(
      'A custom item with id "mymod:ruby" already exists',
    );
    expect(useCustomItemStore.getState().customItems).toHaveLength(1);
  });

  it("rejects invalid ids with a version-specific hint", async () => {
    await expect(create({ id: "ruby", displayName: "Ruby" })).rejects.toThrow(
      'Invalid custom item id "ruby". Use namespace:path',
    );
    await expect(create({ id: "mymod:Ruby Gem", displayName: "Ruby" })).rejects.toThrow(
      "a-z, 0-9, _, ., -, /",
    );
    expect(useCustomItemStore.getState().customItems).toHaveLength(0);
  });

  it("applies Bedrock identifier rules on Bedrock", async () => {
    useSettingsStore.setState({ minecraftVersion: MinecraftVersion.Bedrock });

    await expect(create({ id: "mymod:ruby-gem", displayName: "Ruby" })).rejects.toThrow(
      "a-z, 0-9, _",
    );

    const result = await create({ id: "mymod:ruby", displayName: "Ruby" });

    expect(result.ref).toBe("mymod:ruby");
    expect(useCustomItemStore.getState().customItems[0]._version).toBe(MinecraftVersion.Bedrock);
  });

  it("rejects empty display names", async () => {
    await expect(create({ id: "mymod:ruby", displayName: "" })).rejects.toThrow("displayName");
  });
});
