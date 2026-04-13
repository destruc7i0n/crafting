import { describe, expect, it } from "vitest";

import { MinecraftVersion, RecipeType } from "@/data/types";
import { createEmptySlotContext } from "@/stores/recipe/slot-value";
import { recipeStateDefaults } from "@/stores/recipe/types";
import { makeRecipe } from "@/test/recipe-fixtures";

import { validateDatapackExport } from "./validate-datapack-export";

let recipeId = 0;

const createItem = (raw: string, version = MinecraftVersion.V121) => ({
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

describe("validateDatapackExport", () => {
  it("rewrites duplicate auto filenames before export", () => {
    const slotContext = createEmptySlotContext(MinecraftVersion.V121);
    const issues = validateDatapackExport({
      recipes: [
        createCraftingRecipe({
          "crafting.1": createItem("minecraft:stone"),
          "crafting.result": createItem("minecraft:stone_button"),
        }),
        createCraftingRecipe({
          "crafting.1": createItem("minecraft:oak_planks"),
          "crafting.result": createItem("minecraft:stone_button"),
        }),
      ],
      version: MinecraftVersion.V121,
      context: { bedrockNamespace: "crafting" },
      slotContext,
    });

    expect(issues).toEqual([]);
  });

  it("flags blank manual file names before export", () => {
    const slotContext = createEmptySlotContext(MinecraftVersion.V121);
    const issues = validateDatapackExport({
      recipes: [
        createCraftingRecipe(
          {
            "crafting.1": createItem("minecraft:stone"),
            "crafting.result": createItem("minecraft:stone_button"),
          },
          { nameMode: "manual", name: "" },
        ),
      ],
      version: MinecraftVersion.V121,
      context: { bedrockNamespace: "crafting" },
      slotContext,
    });

    expect(issues).toEqual([
      {
        recipe: expect.any(Object),
        name: "stone_button",
        errors: ["Add a file name"],
      },
    ]);
  });
});
