import { describe, expect, it } from "vitest";

import { MinecraftVersion, RecipeType } from "@/data/types";
import { createEmptySlotContext } from "@/stores/recipe/slot-value";
import { recipeStateDefaults } from "@/stores/recipe/types";
import { makeRecipe } from "@/test/recipe-fixtures";

import { validateBehaviorPackExport } from "./validate-behavior-pack-export";

let recipeId = 0;

const createItem = (raw: string, version = MinecraftVersion.Bedrock) => ({
  type: "default_item" as const,
  id: {
    raw,
    id: raw.split(":").at(-1) ?? raw,
    namespace: raw.includes(":") ? raw.split(":")[0] : "minecraft",
  },
  displayName: raw.split(":").at(-1) ?? raw,
  texture: "",
  _version: version,
});

const createCraftingRecipe = (
  slots: Record<string, ReturnType<typeof createItem>>,
  overrides: Parameters<typeof makeRecipe>[0] = {},
) =>
  makeRecipe({
    id: overrides.id ?? `recipe-${(recipeId += 1)}`,
    recipeType: RecipeType.Crafting,
    slots,
    crafting: { ...recipeStateDefaults.crafting, shapeless: true },
    ...overrides,
  });

describe("validateBehaviorPackExport", () => {
  it("flags blank manual Bedrock names", () => {
    const slotContext = createEmptySlotContext(MinecraftVersion.Bedrock);
    const issues = validateBehaviorPackExport(
      [
        createCraftingRecipe(
          {
            "crafting.1": createItem("minecraft:stone"),
            "crafting.result": createItem("minecraft:stone_button"),
          },
          {
            bedrock: { identifierMode: "manual", identifierName: "", priority: 0 },
          },
        ),
      ],
      { bedrockNamespace: "crafting" },
      slotContext,
    );

    expect(issues).toEqual([
      {
        recipe: expect.any(Object),
        name: "stone_button",
        errors: ["Add a Bedrock name"],
      },
    ]);
  });

  it("rewrites duplicate auto identifiers before export", () => {
    const slotContext = createEmptySlotContext(MinecraftVersion.Bedrock);
    const issues = validateBehaviorPackExport(
      [
        createCraftingRecipe({
          "crafting.1": createItem("minecraft:stone"),
          "crafting.result": createItem("minecraft:stone_button"),
        }),
        createCraftingRecipe({
          "crafting.1": createItem("minecraft:oak_planks"),
          "crafting.result": createItem("minecraft:stone_button"),
        }),
      ],
      { bedrockNamespace: "crafting" },
      slotContext,
    );

    expect(issues).toEqual([]);
  });

  it("flags invalid Bedrock identifier syntax", () => {
    const slotContext = createEmptySlotContext(MinecraftVersion.Bedrock);
    const issues = validateBehaviorPackExport(
      [
        createCraftingRecipe(
          {
            "crafting.1": createItem("minecraft:stone"),
            "crafting.result": createItem("minecraft:stone_button"),
          },
          {
            bedrock: { identifierMode: "manual", identifierName: "Bad-Id", priority: 0 },
          },
        ),
      ],
      { bedrockNamespace: "Crafting" },
      slotContext,
    );

    expect(issues).toEqual([
      {
        recipe: expect.any(Object),
        name: "stone_button",
        errors: ["Use a valid Bedrock identifier (namespace:name; a-z, 0-9, _)"],
      },
    ]);
  });
});
