import { MinecraftVersion, RecipeType } from "@/data/types";
import { SLOTS } from "@/recipes/slots";
import { itemSlot, makeRecipe, vanillaTagSlot } from "@/test/recipe-fixtures";

import {
  ALL_RECIPE_SLOTS,
  assertSlotAllowed,
  assertSlotValueAllowed,
  getSlotLayout,
  isRecipeSlot,
} from "./slot-rules";

const stick = itemSlot({ namespace: "minecraft", id: "stick" });
const planks = vanillaTagSlot({ namespace: "minecraft", id: "planks" });

describe("ALL_RECIPE_SLOTS / isRecipeSlot", () => {
  it("lists every non-brewing slot", () => {
    expect(ALL_RECIPE_SLOTS).toHaveLength(18);
    expect(ALL_RECIPE_SLOTS).toContain("crafting.1");
    expect(ALL_RECIPE_SLOTS).toContain("smithing.template");
    expect(ALL_RECIPE_SLOTS).not.toContain("brewing.reagent");
  });

  it("recognises slot ids", () => {
    expect(isRecipeSlot("crafting.result")).toBe(true);
    expect(isRecipeSlot("cooking.ingredient")).toBe(true);
    expect(isRecipeSlot("brewing.input")).toBe(false);
    expect(isRecipeSlot("crafting.10")).toBe(false);
  });
});

describe("getSlotLayout", () => {
  it("describes the full crafting grid", () => {
    const layout = getSlotLayout(makeRecipe({ recipeType: RecipeType.Crafting }));

    expect(layout.map((entry) => entry.slot)).toEqual([
      "crafting.1",
      "crafting.2",
      "crafting.3",
      "crafting.4",
      "crafting.5",
      "crafting.6",
      "crafting.7",
      "crafting.8",
      "crafting.9",
      "crafting.result",
    ]);
    expect(layout.filter((entry) => entry.role === "result").map((entry) => entry.slot)).toEqual([
      "crafting.result",
    ]);
    expect(layout.filter((entry) => entry.canEditCount).map((entry) => entry.slot)).toEqual([
      "crafting.result",
    ]);
    expect(layout.every((entry) => !entry.disabled)).toBe(true);
  });

  it("only lists the 2x2 slots when twoByTwo is enabled", () => {
    const layout = getSlotLayout(
      makeRecipe({ recipeType: RecipeType.Crafting, crafting: { twoByTwo: true } }),
    );

    expect(layout.map((entry) => entry.slot)).toEqual([
      "crafting.1",
      "crafting.2",
      "crafting.4",
      "crafting.5",
      "crafting.result",
    ]);
  });

  it("describes smelting slots without editable counts", () => {
    expect(getSlotLayout(makeRecipe({ recipeType: RecipeType.Smelting }))).toEqual([
      { slot: "cooking.ingredient", role: "input", disabled: false, canEditCount: false },
      { slot: "cooking.result", role: "result", disabled: false, canEditCount: false },
    ]);
  });

  it("omits the result slot for smithing trim", () => {
    const layout = getSlotLayout(makeRecipe({ recipeType: RecipeType.SmithingTrim }));

    expect(layout.map((entry) => entry.slot)).toEqual([
      "smithing.template",
      "smithing.base",
      "smithing.addition",
    ]);
    expect(layout.every((entry) => entry.role === "input")).toBe(true);
  });
});

describe("assertSlotAllowed", () => {
  it("accepts slots of the recipe type", () => {
    expect(() =>
      assertSlotAllowed(makeRecipe({ recipeType: RecipeType.Crafting }), SLOTS.crafting.slot9),
    ).not.toThrow();
    expect(() =>
      assertSlotAllowed(makeRecipe({ recipeType: RecipeType.Smelting }), SLOTS.cooking.result),
    ).not.toThrow();
  });

  it("rejects slots from other recipe types", () => {
    expect(() =>
      assertSlotAllowed(makeRecipe({ recipeType: RecipeType.Crafting }), SLOTS.cooking.ingredient),
    ).toThrow(
      'Slot "cooking.ingredient" is not part of a Crafting recipe. Available slots: crafting.1, crafting.2, crafting.3, crafting.4, crafting.5, crafting.6, crafting.7, crafting.8, crafting.9, crafting.result',
    );
  });

  it("rejects slots disabled by twoByTwo", () => {
    expect(() =>
      assertSlotAllowed(
        makeRecipe({ recipeType: RecipeType.Crafting, crafting: { twoByTwo: true } }),
        SLOTS.crafting.slot3,
      ),
    ).toThrow(
      'Slot "crafting.3" is disabled while twoByTwo is enabled. Available slots: crafting.1, crafting.2, crafting.4, crafting.5, crafting.result',
    );
  });

  it("rejects the result slot for smithing trim", () => {
    expect(() =>
      assertSlotAllowed(makeRecipe({ recipeType: RecipeType.SmithingTrim }), SLOTS.smithing.result),
    ).toThrow(
      'Slot "smithing.result" is not part of a Smithing Trim recipe. Available slots: smithing.template, smithing.base, smithing.addition',
    );
  });
});

describe("assertSlotValueAllowed", () => {
  const crafting = makeRecipe({ recipeType: RecipeType.Crafting });
  const smelting = makeRecipe({ recipeType: RecipeType.Smelting });
  const version = MinecraftVersion.V121;

  it("accepts items in any slot and tags in input slots", () => {
    expect(() =>
      assertSlotValueAllowed({
        recipe: crafting,
        slot: SLOTS.crafting.slot1,
        value: stick,
        version,
      }),
    ).not.toThrow();
    expect(() =>
      assertSlotValueAllowed({
        recipe: crafting,
        slot: SLOTS.crafting.slot1,
        value: planks,
        version,
      }),
    ).not.toThrow();
    expect(() =>
      assertSlotValueAllowed({
        recipe: crafting,
        slot: SLOTS.crafting.result,
        value: stick,
        count: 64,
        version,
      }),
    ).not.toThrow();
  });

  it("rejects tags in result slots", () => {
    expect(() =>
      assertSlotValueAllowed({
        recipe: crafting,
        slot: SLOTS.crafting.result,
        value: planks,
        version,
      }),
    ).toThrow("Result slots must contain an item, not a tag");
  });

  it("rejects tags on versions without item tags", () => {
    expect(() =>
      assertSlotValueAllowed({
        recipe: crafting,
        slot: SLOTS.crafting.slot1,
        value: planks,
        version: MinecraftVersion.V112,
      }),
    ).toThrow("Item tags are not available in Java 1.12");
  });

  it("rejects counts on tags", () => {
    expect(() =>
      assertSlotValueAllowed({
        recipe: crafting,
        slot: SLOTS.crafting.slot1,
        value: planks,
        count: 2,
        version,
      }),
    ).toThrow("Tags do not have a count");
  });

  it("only allows counts on the editable result slot", () => {
    expect(() =>
      assertSlotValueAllowed({
        recipe: crafting,
        slot: SLOTS.crafting.slot1,
        value: stick,
        count: 2,
        version,
      }),
    ).toThrow("Only the result slot's count can be edited for Crafting recipes");
  });

  it("rejects counts for recipe types without editable counts", () => {
    expect(() =>
      assertSlotValueAllowed({
        recipe: smelting,
        slot: SLOTS.cooking.result,
        value: stick,
        count: 2,
        version,
      }),
    ).toThrow("Counts cannot be edited for Smelting recipes");
  });

  it.each([0, 65, 1.5, Number.NaN])("rejects the count %s", (count) => {
    expect(() =>
      assertSlotValueAllowed({
        recipe: crafting,
        slot: SLOTS.crafting.result,
        value: stick,
        count,
        version,
      }),
    ).toThrow(`Count must be an integer between 1 and 64 (got ${count})`);
  });
});
