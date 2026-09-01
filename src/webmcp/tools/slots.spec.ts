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
import { clearRecipeSlotsTool, setCraftingPatternTool, setSlotsTool } from "./slots";

const stick = { namespace: "minecraft", id: "stick" };
const ironOre = { namespace: "minecraft", id: "iron_ore" };

const items = [
  makeItem("stick"),
  makeItem("oak_planks"),
  makeItem("wooden_pickaxe"),
  makeItem("iron_ore"),
  makeItem("iron_ingot"),
];

const vanillaTags = { "minecraft:planks": ["minecraft:oak_planks"] };

const planksTag = { kind: "vanilla_tag", id: { namespace: "minecraft", id: "planks" } };
const stickItem = { kind: "item", id: stick };
const pickaxeItem = { kind: "item", id: { namespace: "minecraft", id: "wooden_pickaxe" } };

const getSelected = () => {
  const { recipes, selectedRecipeId } = useRecipeStore.getState();
  return recipes.find((recipe) => recipe.id === selectedRecipeId);
};

const selectSmelting = (slots: NonNullable<Parameters<typeof makeRecipe>[0]>["slots"] = {}) => {
  useRecipeStore.setState({
    recipes: [makeRecipe({ id: "r1", recipeType: RecipeType.Smelting, slots })],
    selectedRecipeId: "r1",
  });
};

const pickaxeInput = {
  pattern: ["###", " / ", " / "],
  key: { "#": "#minecraft:planks", "/": "minecraft:stick" },
  result: "minecraft:wooden_pickaxe",
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
  it.each([setSlotsTool, setCraftingPatternTool, clearRecipeSlotsTool])(
    "$name exposes an object input schema",
    (tool) => {
      expect(tool.inputSchema?.type).toBe("object");
    },
  );
});

describe("set_slots", () => {
  it("fills a cooking recipe from refs and objects", async () => {
    selectSmelting();
    useUIStore.setState({ lastPlacedSlot: SLOTS.cooking.result });

    const summary = (await setSlotsTool.execute({
      slots: {
        "cooking.ingredient": "minecraft:iron_ore",
        "cooking.result": { item: "minecraft:iron_ingot" },
      },
    })) as RecipeSummary;

    expect(getSelected()?.slots).toEqual({
      [SLOTS.cooking.ingredient]: { kind: "item", id: ironOre },
      [SLOTS.cooking.result]: { kind: "item", id: { namespace: "minecraft", id: "iron_ingot" } },
    });
    expect(summary.slots[SLOTS.cooking.ingredient]).toMatchObject({ ref: "minecraft:iron_ore" });
    expect(summary.slots[SLOTS.cooking.result]).toMatchObject({ ref: "minecraft:iron_ingot" });
    expect(summary.valid).toBe(true);
    expect(useUIStore.getState().lastPlacedSlot).toBeUndefined();
  });

  it("clears slots with null and applies result counts", async () => {
    useRecipeStore.setState({
      recipes: [makeRecipe({ id: "r1", slots: { [SLOTS.crafting.slot1]: itemSlot(stick) } })],
      selectedRecipeId: "r1",
    });

    await setSlotsTool.execute({
      slots: {
        "crafting.1": null,
        "crafting.result": { item: "stick", count: 4 },
      },
    });

    expect(getSelected()?.slots).toEqual({
      [SLOTS.crafting.slot1]: undefined,
      [SLOTS.crafting.result]: { ...stickItem, count: 4 },
    });
  });

  it("rejects an empty slot map", async () => {
    await expect(setSlotsTool.execute({ slots: {} })).rejects.toThrow("No slots provided");
  });

  it("rejects unknown slot ids", async () => {
    await expect(setSlotsTool.execute({ slots: { "crafting.10": "stick" } })).rejects.toThrow(
      'Unknown slot "crafting.10". Valid slots: crafting.1, crafting.2',
    );
  });

  it("rejects slots that are not part of the recipe layout", async () => {
    selectSmelting();

    await expect(setSlotsTool.execute({ slots: { "crafting.1": "stick" } })).rejects.toThrow(
      'Slot "crafting.1" is not part of a Smelting recipe. Available slots: cooking.ingredient, cooking.result',
    );
  });

  it("rejects tags in result slots", async () => {
    await expect(
      setSlotsTool.execute({ slots: { "crafting.result": "#minecraft:planks" } }),
    ).rejects.toThrow("Result slots must contain an item, not a tag");
  });

  it("rejects counts on slots without editable counts", async () => {
    await expect(
      setSlotsTool.execute({ slots: { "crafting.1": { item: "stick", count: 2 } } }),
    ).rejects.toThrow("Only the result slot's count can be edited for Crafting recipes");

    selectSmelting();

    await expect(
      setSlotsTool.execute({ slots: { "cooking.result": { item: "iron_ingot", count: 2 } } }),
    ).rejects.toThrow("Counts cannot be edited for Smelting recipes");
  });

  it("rejects unknown refs with suggestions", async () => {
    selectSmelting();

    await expect(
      setSlotsTool.execute({ slots: { "cooking.ingredient": "minecraft:iron_or" } }),
    ).rejects.toThrow('Unknown ingredient "minecraft:iron_or". Did you mean: minecraft:iron_ore');
  });

  it("writes nothing when any entry is invalid", async () => {
    selectSmelting({ [SLOTS.cooking.ingredient]: itemSlot(stick) });

    await expect(
      setSlotsTool.execute({
        slots: {
          "cooking.ingredient": "minecraft:iron_ore",
          "cooking.result": "#minecraft:planks",
        },
      }),
    ).rejects.toThrow("Result slots must contain an item, not a tag");

    expect(getSelected()?.slots).toEqual({ [SLOTS.cooking.ingredient]: stickItem });
  });
});

describe("set_crafting_pattern", () => {
  it("fills the grid for a wooden pickaxe", async () => {
    const summary = (await setCraftingPatternTool.execute(pickaxeInput)) as RecipeSummary;

    expect(getSelected()?.slots).toEqual({
      [SLOTS.crafting.slot1]: planksTag,
      [SLOTS.crafting.slot2]: planksTag,
      [SLOTS.crafting.slot3]: planksTag,
      [SLOTS.crafting.slot4]: undefined,
      [SLOTS.crafting.slot5]: stickItem,
      [SLOTS.crafting.slot6]: undefined,
      [SLOTS.crafting.slot7]: undefined,
      [SLOTS.crafting.slot8]: stickItem,
      [SLOTS.crafting.slot9]: undefined,
      [SLOTS.crafting.result]: pickaxeItem,
    });
    expect(summary.valid).toBe(true);
    expect(summary.warnings).toEqual([]);
    expect(summary.slots[SLOTS.crafting.result]).toMatchObject({ ref: "minecraft:wooden_pickaxe" });
  });

  it("replaces the whole grid, applies resultCount and shapeless", async () => {
    useRecipeStore.setState({
      recipes: [
        makeRecipe({
          id: "r1",
          slots: {
            [SLOTS.crafting.slot9]: itemSlot(stick),
            [SLOTS.crafting.result]: itemSlot(stick, 2),
          },
        }),
      ],
      selectedRecipeId: "r1",
    });

    const summary = (await setCraftingPatternTool.execute({
      pattern: ["#", "#"],
      key: { "#": "oak_planks" },
      result: "stick",
      resultCount: 4,
      shapeless: true,
    })) as RecipeSummary;

    const slots = getSelected()?.slots ?? {};

    expect(slots[SLOTS.crafting.slot9]).toBeUndefined();
    expect(slots[SLOTS.crafting.slot1]).toEqual({
      kind: "item",
      id: { namespace: "minecraft", id: "oak_planks" },
    });
    expect(slots[SLOTS.crafting.slot4]).toEqual(slots[SLOTS.crafting.slot1]);
    expect(slots[SLOTS.crafting.result]).toEqual({ ...stickItem, count: 4 });
    expect(summary.options.crafting).toMatchObject({ shapeless: true });
    expect(summary.slots[SLOTS.crafting.result]?.count).toBe(4);
  });

  it("rejects pattern characters missing from the key", async () => {
    await expect(
      setCraftingPatternTool.execute({ ...pickaxeInput, key: { "#": "#minecraft:planks" } }),
    ).rejects.toThrow('Pattern character "/" is not defined in key');
    expect(getSelected()?.slots).toEqual({});
  });

  it("warns about unused key characters", async () => {
    const summary = (await setCraftingPatternTool.execute({
      ...pickaxeInput,
      key: { ...pickaxeInput.key, X: "iron_ingot" },
    })) as RecipeSummary;

    expect(summary.warnings).toEqual(['Key "X" is not used in the pattern']);
  });

  it("rejects patterns wider than 2 when twoByTwo is enabled", async () => {
    useRecipeStore.setState({
      recipes: [makeRecipe({ id: "r1", crafting: { twoByTwo: true } })],
      selectedRecipeId: "r1",
    });

    await expect(setCraftingPatternTool.execute(pickaxeInput)).rejects.toThrow(
      "twoByTwo is enabled: pattern must be at most 2x2 (or disable it with update_recipe)",
    );

    await setCraftingPatternTool.execute({
      pattern: ["##", "##"],
      key: { "#": "oak_planks" },
      result: "stick",
    });

    expect(getSelected()?.slots[SLOTS.crafting.slot5]).toEqual({
      kind: "item",
      id: { namespace: "minecraft", id: "oak_planks" },
    });
  });

  it("rejects tags as the result", async () => {
    await expect(
      setCraftingPatternTool.execute({ ...pickaxeInput, result: "#minecraft:planks" }),
    ).rejects.toThrow("Result slots must contain an item, not a tag");
    expect(getSelected()?.slots).toEqual({});
  });

  it("rejects unknown refs without writing anything", async () => {
    await expect(
      setCraftingPatternTool.execute({ ...pickaxeInput, result: "minecraft:wooden_pickaxes" }),
    ).rejects.toThrow('Unknown ingredient "minecraft:wooden_pickaxes"');
    expect(getSelected()?.slots).toEqual({});
  });

  it("switches a smelting recipe to crafting and warns", async () => {
    selectSmelting({ [SLOTS.cooking.ingredient]: itemSlot(ironOre) });

    const summary = (await setCraftingPatternTool.execute(pickaxeInput)) as RecipeSummary;

    expect(summary.recipeType).toBe(RecipeType.Crafting);
    expect(summary.warnings).toEqual([
      "Recipe type changed from smelting to crafting",
      'Cleared slot "cooking.ingredient" because it is not part of a Crafting recipe',
    ]);
    expect(getSelected()?.slots[SLOTS.cooking.ingredient]).toBeUndefined();
    expect(getSelected()?.slots[SLOTS.crafting.slot1]).toEqual(planksTag);
  });

  it("warns when leading or trailing whitespace would be trimmed", async () => {
    const summary = (await setCraftingPatternTool.execute({
      pattern: [" # ", " / "],
      key: pickaxeInput.key,
      result: "stick",
    })) as RecipeSummary;

    expect(summary.warnings).toEqual([
      "Whitespace rows/columns are trimmed in the generated JSON unless crafting.keepWhitespace is true",
    ]);
    expect(getSelected()?.slots[SLOTS.crafting.slot2]).toEqual(planksTag);
    expect(getSelected()?.slots[SLOTS.crafting.slot5]).toEqual(stickItem);
  });

  it("does not warn about whitespace when keepWhitespace is enabled", async () => {
    useRecipeStore.setState({
      recipes: [makeRecipe({ id: "r1", crafting: { keepWhitespace: true } })],
      selectedRecipeId: "r1",
    });

    const summary = (await setCraftingPatternTool.execute({
      pattern: [" #"],
      key: { "#": "oak_planks" },
      result: "stick",
    })) as RecipeSummary;

    expect(summary.warnings).toEqual([]);
  });
});

describe("clear_recipe_slots", () => {
  it("empties every slot and the interaction state", async () => {
    useRecipeStore.setState({
      recipes: [
        makeRecipe({
          id: "r1",
          name: "keep_me",
          slots: {
            [SLOTS.crafting.slot1]: itemSlot(stick),
            [SLOTS.crafting.result]: itemSlot(stick, 4),
          },
        }),
      ],
      selectedRecipeId: "r1",
    });
    useUIStore.setState({
      selection: { type: "slot", slot: SLOTS.crafting.slot1, value: itemSlot(stick) },
      lastPlacedSlot: SLOTS.crafting.slot1,
    });

    const summary = (await clearRecipeSlotsTool.execute({})) as RecipeSummary;

    expect(getSelected()?.slots).toEqual({});
    expect(getSelected()?.name).toBe("keep_me");
    expect(summary.slots).toEqual({});
    expect(useUIStore.getState().selection).toBeUndefined();
    expect(useUIStore.getState().lastPlacedSlot).toBeUndefined();
  });
});
