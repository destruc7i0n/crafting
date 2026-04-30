import { describe, expect, it } from "vitest";

import { RecipeType } from "@/data/types";
import { SLOTS } from "@/recipes/slots";

import { buildRecipeCatalogEntry } from "./recipe-handlers";

describe("buildRecipeCatalogEntry", () => {
  it("keeps generated catalog entries lean", () => {
    const entry = buildRecipeCatalogEntry({
      recipe: {
        type: "minecraft:crafting_shapeless",
        group: "planks",
        category: "building",
        ingredients: [{ item: "minecraft:oak_log" }],
        result: { id: "minecraft:oak_planks", count: 4 },
      },
    });

    expect(Object.keys(entry ?? {}).sort()).toEqual(["recipeType", "slots"]);
  });

  it("places a single shapeless ingredient in the center of the 3x3 grid", () => {
    const entry = buildRecipeCatalogEntry({
      recipe: {
        type: "minecraft:crafting_shapeless",
        ingredients: [{ item: "minecraft:oak_log" }],
        result: { id: "minecraft:oak_planks", count: 4 },
      },
    });

    expect(entry).toEqual({
      recipeType: RecipeType.Crafting,
      slots: {
        [SLOTS.crafting.slot5]: { kind: "item", id: "minecraft:oak_log" },
        [SLOTS.crafting.result]: { kind: "item", id: "minecraft:oak_planks", count: 4 },
      },
    });
  });

  it("centers one-cell shaped recipes on the 3x3 grid", () => {
    const entry = buildRecipeCatalogEntry({
      recipe: {
        type: "crafting_shaped",
        pattern: ["#"],
        key: { "#": { item: "minecraft:stone" } },
        result: { item: "minecraft:stone_button" },
      },
    });

    expect(entry?.slots[SLOTS.crafting.slot5]).toEqual({
      kind: "item",
      id: "minecraft:stone",
    });
  });

  it("places two-row shaped recipes in the middle and bottom rows", () => {
    const entry = buildRecipeCatalogEntry({
      recipe: {
        type: "crafting_shaped",
        pattern: ["ABC", "DEF"],
        key: {
          A: { item: "minecraft:apple" },
          B: { item: "minecraft:bread" },
          C: { item: "minecraft:carrot" },
          D: { item: "minecraft:diamond" },
          E: { item: "minecraft:emerald" },
          F: { item: "minecraft:flint" },
        },
        result: { item: "minecraft:stick" },
      },
    });

    expect(entry?.slots[SLOTS.crafting.slot1]).toBeUndefined();
    expect(entry?.slots[SLOTS.crafting.slot2]).toBeUndefined();
    expect(entry?.slots[SLOTS.crafting.slot3]).toBeUndefined();
    expect(entry?.slots[SLOTS.crafting.slot4]).toEqual({
      kind: "item",
      id: "minecraft:apple",
    });
    expect(entry?.slots[SLOTS.crafting.slot5]).toEqual({
      kind: "item",
      id: "minecraft:bread",
    });
    expect(entry?.slots[SLOTS.crafting.slot6]).toEqual({
      kind: "item",
      id: "minecraft:carrot",
    });
    expect(entry?.slots[SLOTS.crafting.slot7]).toEqual({
      kind: "item",
      id: "minecraft:diamond",
    });
    expect(entry?.slots[SLOTS.crafting.slot8]).toEqual({
      kind: "item",
      id: "minecraft:emerald",
    });
    expect(entry?.slots[SLOTS.crafting.slot9]).toEqual({
      kind: "item",
      id: "minecraft:flint",
    });
  });

  it("keeps three-row shaped recipes in the full 3x3 pattern", () => {
    const entry = buildRecipeCatalogEntry({
      recipe: {
        type: "crafting_shaped",
        pattern: ["ABC", "DEF", "GHI"],
        key: {
          A: { item: "minecraft:apple" },
          B: { item: "minecraft:bread" },
          C: { item: "minecraft:carrot" },
          D: { item: "minecraft:diamond" },
          E: { item: "minecraft:emerald" },
          F: { item: "minecraft:flint" },
          G: { item: "minecraft:gold_ingot" },
          H: { item: "minecraft:honeycomb" },
          I: { item: "minecraft:iron_ingot" },
        },
        result: { item: "minecraft:stick" },
      },
    });

    expect(entry?.slots[SLOTS.crafting.slot1]).toEqual({
      kind: "item",
      id: "minecraft:apple",
    });
    expect(entry?.slots[SLOTS.crafting.slot2]).toEqual({
      kind: "item",
      id: "minecraft:bread",
    });
    expect(entry?.slots[SLOTS.crafting.slot3]).toEqual({
      kind: "item",
      id: "minecraft:carrot",
    });
    expect(entry?.slots[SLOTS.crafting.slot4]).toEqual({
      kind: "item",
      id: "minecraft:diamond",
    });
    expect(entry?.slots[SLOTS.crafting.slot5]).toEqual({
      kind: "item",
      id: "minecraft:emerald",
    });
    expect(entry?.slots[SLOTS.crafting.slot6]).toEqual({
      kind: "item",
      id: "minecraft:flint",
    });
    expect(entry?.slots[SLOTS.crafting.slot7]).toEqual({
      kind: "item",
      id: "minecraft:gold_ingot",
    });
    expect(entry?.slots[SLOTS.crafting.slot8]).toEqual({
      kind: "item",
      id: "minecraft:honeycomb",
    });
    expect(entry?.slots[SLOTS.crafting.slot9]).toEqual({
      kind: "item",
      id: "minecraft:iron_ingot",
    });
  });

  it("translates tags and alternatives", () => {
    const entry = buildRecipeCatalogEntry({
      recipe: {
        type: "crafting_shaped",
        pattern: ["#", "#"],
        key: {
          "#": [{ item: "minecraft:bamboo" }, { tag: "minecraft:planks" }],
        },
        result: { item: "minecraft:stick", count: 4 },
      },
    });

    expect(entry?.slots[SLOTS.crafting.slot5]).toEqual({
      kind: "alternatives",
      values: [
        { kind: "item", id: "minecraft:bamboo" },
        { kind: "tag", id: "minecraft:planks" },
      ],
    });
  });

  it("translates supported concrete-output types to RecipeType", () => {
    const cases = [
      ["smelting", RecipeType.Smelting],
      ["blasting", RecipeType.Blasting],
      ["campfire_cooking", RecipeType.CampfireCooking],
      ["smoking", RecipeType.Smoking],
    ] as const;

    for (const [rawType, recipeType] of cases) {
      expect(
        buildRecipeCatalogEntry({
          recipe: {
            type: `minecraft:${rawType}`,
            ingredient: { item: "minecraft:raw_iron" },
            result: { id: "minecraft:iron_ingot" },
          },
        })?.recipeType,
      ).toBe(recipeType);
    }

    expect(
      buildRecipeCatalogEntry({
        recipe: {
          type: "minecraft:stonecutting",
          ingredient: { tag: "minecraft:stone_crafting_materials" },
          result: "minecraft:stone_slab",
          count: 2,
        },
      })?.recipeType,
    ).toBe(RecipeType.Stonecutter);

    expect(
      buildRecipeCatalogEntry({
        recipe: {
          type: "minecraft:smithing_transform",
          template: "minecraft:netherite_upgrade_smithing_template",
          base: "minecraft:diamond_sword",
          addition: "minecraft:netherite_ingot",
          result: { id: "minecraft:netherite_sword" },
        },
      })?.recipeType,
    ).toBe(RecipeType.SmithingTransform);
  });

  it("skips unknown, special, malformed, transmute, and no-concrete-output recipes", () => {
    expect(
      buildRecipeCatalogEntry({
        recipe: { type: "minecraft:crafting_special_mapcloning" },
      }),
    ).toBeNull();

    expect(
      buildRecipeCatalogEntry({
        recipe: { type: "minecraft:future_recipe" },
      }),
    ).toBeNull();

    expect(
      buildRecipeCatalogEntry({
        recipe: { type: "minecraft:crafting_shapeless", result: { id: "minecraft:stick" } },
      }),
    ).toBeNull();

    expect(
      buildRecipeCatalogEntry({
        recipe: { type: "minecraft:smithing_trim" },
      }),
    ).toBeNull();

    expect(
      buildRecipeCatalogEntry({
        recipe: {
          type: "minecraft:crafting_transmute",
          input: "minecraft:iron_ingot",
          material: "minecraft:stick",
          result: "minecraft:iron_sword",
        },
      }),
    ).toBeNull();
  });
});
