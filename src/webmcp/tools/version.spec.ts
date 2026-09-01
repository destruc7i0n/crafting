import { MinecraftVersion, RecipeType } from "@/data/types";
import { SLOTS } from "@/recipes/slots";
import { useCustomItemStore } from "@/stores/custom-item";
import { useRecipeStore } from "@/stores/recipe";
import { useSettingsStore } from "@/stores/settings";
import { useTagStore } from "@/stores/tag";
import { itemSlot, makeRecipe } from "@/test/recipe-fixtures";
import { makeItem, seedResources } from "@/test/resource-fixtures";

import { setMinecraftVersionTool } from "./version";

type VersionResult = {
  version: MinecraftVersion;
  versionLabel: string;
  supportedRecipeTypes: RecipeType[];
  clearedAllSlots: boolean;
  selectedRecipe: { id: string; slots: Record<string, unknown>; warnings: string[] };
};

const stick = { namespace: "minecraft", id: "stick" };
const oakPlanks = { namespace: "minecraft", id: "oak_planks" };

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

const setVersion = (input: Record<string, unknown>) =>
  setMinecraftVersionTool.execute(input) as Promise<VersionResult>;

const getSlotCounts = () =>
  useRecipeStore.getState().recipes.map((recipe) => Object.keys(recipe.slots).length);

describe("set_minecraft_version", () => {
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
        makeRecipe({
          id: "recipe-smithing",
          recipeType: RecipeType.SmithingTransform,
          slots: { [SLOTS.smithing.base]: itemSlot(stick) },
        }),
      ],
      selectedRecipeId: "recipe-stick",
    });
    useCustomItemStore.setState({ customItems: [] });
    useTagStore.setState({ tags: [] });
    seedVersion(MinecraftVersion.V121);
    seedVersion(MinecraftVersion.V116);
    seedVersion(MinecraftVersion.Bedrock);
  });

  it("exposes an object input schema listing every version", () => {
    expect(setMinecraftVersionTool.name).toBe("set_minecraft_version");
    expect(setMinecraftVersionTool.inputSchema?.type).toBe("object");
    expect(setMinecraftVersionTool.inputSchema).toMatchObject({
      properties: {
        version: { enum: expect.arrayContaining(["bedrock", "1.12", "1.21", "26.2"]) },
        confirmClearAllSlots: { type: "boolean", default: false },
      },
      required: ["version"],
    });
    expect(setMinecraftVersionTool.description).toContain('"bedrock" (Bedrock)');
  });

  it("rejects unknown versions", async () => {
    await expect(setVersion({ version: "9.9" })).rejects.toThrow("version");
    expect(useSettingsStore.getState().minecraftVersion).toBe(MinecraftVersion.V121);
  });

  it("reports an unchanged version without touching recipes", async () => {
    const result = await setVersion({ version: MinecraftVersion.V121 });

    expect(result.version).toBe(MinecraftVersion.V121);
    expect(result.clearedAllSlots).toBe(false);
    expect(result.selectedRecipe.warnings).toEqual(["Version unchanged"]);
    expect(getSlotCounts()).toEqual([3, 1]);
  });

  it("switches between Java versions while keeping slots", async () => {
    const result = await setVersion({ version: MinecraftVersion.V116 });

    expect(useSettingsStore.getState().minecraftVersion).toBe(MinecraftVersion.V116);
    expect(result).toMatchObject({
      version: MinecraftVersion.V116,
      versionLabel: "Java 1.16.5",
      clearedAllSlots: false,
    });
    expect(result.supportedRecipeTypes).toContain(RecipeType.Smithing);
    expect(result.supportedRecipeTypes).not.toContain(RecipeType.SmithingTransform);
    expect(result.selectedRecipe.id).toBe("recipe-stick");
    expect(result.selectedRecipe.warnings).toEqual([
      'Recipe "Smithing Transform Recipe" uses smithing_transform, which is not available in Java 1.16.5; change it with update_recipe',
    ]);
    expect(getSlotCounts()).toEqual([3, 1]);
  });

  it("refuses a Java to Bedrock switch until confirmed", async () => {
    await expect(setVersion({ version: MinecraftVersion.Bedrock })).rejects.toThrow(
      "Switching between Java and Bedrock clears every slot in all 2 recipes. Ask the user, then call again with confirmClearAllSlots: true.",
    );
    expect(useSettingsStore.getState().minecraftVersion).toBe(MinecraftVersion.V121);
    expect(getSlotCounts()).toEqual([3, 1]);
  });

  it("clears every slot when a cross-platform switch is confirmed", async () => {
    const result = await setVersion({
      version: MinecraftVersion.Bedrock,
      confirmClearAllSlots: true,
    });

    expect(useSettingsStore.getState().minecraftVersion).toBe(MinecraftVersion.Bedrock);
    expect(result).toMatchObject({
      version: MinecraftVersion.Bedrock,
      versionLabel: "Bedrock",
      clearedAllSlots: true,
    });
    expect(result.selectedRecipe.slots).toEqual({});
    expect(getSlotCounts()).toEqual([0, 0]);
    expect(result.selectedRecipe.warnings).toEqual([]);
  });

  it("does not need confirmation when switching Bedrock to Bedrock", async () => {
    useSettingsStore.setState({ minecraftVersion: MinecraftVersion.Bedrock });

    const result = await setVersion({ version: MinecraftVersion.Bedrock });

    expect(result.clearedAllSlots).toBe(false);
    expect(getSlotCounts()).toEqual([3, 1]);
  });
});
