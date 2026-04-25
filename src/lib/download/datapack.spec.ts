import { beforeEach, describe, expect, it, vi } from "vitest";

import { MinecraftVersion, RecipeType } from "@/data/types";
import { createEmptySlotContext } from "@/stores/recipe/slot-value";
import { recipeStateDefaults } from "@/stores/recipe/types";
import { makeRecipe } from "@/test/recipe-fixtures";

import type { GeneratedRecipe } from "@/recipes/generate/types";

const { createDatapackBlob, downloadBlob, generate } = vi.hoisted(() => ({
  createDatapackBlob: vi.fn<typeof import("@/data/datapack").createDatapackBlob>(),
  downloadBlob: vi.fn<typeof import("@/data/datapack").downloadBlob>(),
  generate: vi.fn<typeof import("@/recipes/generate").generate>(),
}));

vi.mock("@/data/datapack", () => ({
  createDatapackBlob,
  downloadBlob,
}));

vi.mock("@/recipes/generate", () => ({
  generate,
}));

import { downloadDatapack } from "./datapack";

let recipeId = 0;

const generatedRecipe = {
  type: "minecraft:crafting_shapeless",
  ingredients: [],
  result: {},
} satisfies GeneratedRecipe;

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

describe("downloadDatapack", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("alert", vi.fn());
  });

  it("blocks datapack download on Java 1.12", async () => {
    const recipe = createCraftingRecipe({
      "crafting.1": createItem("minecraft:stone"),
      "crafting.result": createItem("minecraft:stone_button"),
    });
    const slotContext = createEmptySlotContext(MinecraftVersion.V112);

    const result = await downloadDatapack([recipe], MinecraftVersion.V112, {
      tags: [],
      context: { bedrockNamespace: "crafting" },
      slotContext,
    });

    expect(result).toEqual({ status: "blocked" });
    expect(globalThis.alert).toHaveBeenCalledWith(
      "Datapack export is only available for Java 1.13 and newer.",
    );
    expect(generate).not.toHaveBeenCalled();
    expect(createDatapackBlob).not.toHaveBeenCalled();
    expect(downloadBlob).not.toHaveBeenCalled();
  });

  it("blocks datapack download when any recipe is incomplete", async () => {
    const recipe = createCraftingRecipe({
      "crafting.1": createItem("minecraft:stone"),
    });
    const slotContext = createEmptySlotContext(MinecraftVersion.V121);

    const result = await downloadDatapack([recipe], MinecraftVersion.V121, {
      tags: [],
      context: { bedrockNamespace: "crafting" },
      slotContext,
    });

    expect(result).toEqual({ status: "blocked" });
    expect(globalThis.alert).toHaveBeenCalledWith(
      "Please finish all recipes before downloading the datapack:\n\n- Crafting Recipe: Add a result item",
    );
    expect(generate).not.toHaveBeenCalled();
    expect(createDatapackBlob).not.toHaveBeenCalled();
    expect(downloadBlob).not.toHaveBeenCalled();
  });

  it("downloads the datapack when all recipes are valid", async () => {
    const blob = new Blob(["zip"]);
    const recipe = createCraftingRecipe({
      "crafting.1": createItem("minecraft:stone"),
      "crafting.result": createItem("minecraft:stone_button"),
    });
    const slotContext = createEmptySlotContext(MinecraftVersion.V121);

    generate.mockReturnValue(generatedRecipe);
    createDatapackBlob.mockReturnValue(blob);

    const result = await downloadDatapack([recipe], MinecraftVersion.V121, {
      tags: [],
      context: { bedrockNamespace: "crafting" },
      slotContext,
    });

    expect(result).toEqual({ status: "success" });
    expect(globalThis.alert).not.toHaveBeenCalled();
    expect(generate).toHaveBeenCalledWith({
      state: recipe,
      version: MinecraftVersion.V121,
      slotContext,
    });
    expect(createDatapackBlob).toHaveBeenCalledWith(
      MinecraftVersion.V121,
      [{ name: "stone_button", json: generatedRecipe }],
      [],
    );
    expect(downloadBlob).toHaveBeenCalledWith(blob, "datapack.zip");
  });

  it("surfaces generation failures after validation passes", async () => {
    const recipe = createCraftingRecipe({
      "crafting.1": createItem("minecraft:stone"),
      "crafting.result": createItem("minecraft:stone_button"),
    });
    const slotContext = createEmptySlotContext(MinecraftVersion.V121);

    generate.mockImplementation(() => {
      throw new Error("Boom");
    });

    const result = await downloadDatapack([recipe], MinecraftVersion.V121, {
      tags: [],
      context: { bedrockNamespace: "crafting" },
      slotContext,
    });

    expect(result).toEqual({ status: "error" });
    expect(globalThis.alert).toHaveBeenCalledWith(
      "Failed to generate all recipes for the datapack:\n\n- stone_button: Boom",
    );
    expect(createDatapackBlob).not.toHaveBeenCalled();
    expect(downloadBlob).not.toHaveBeenCalled();
  });

  it("surfaces datapack packaging failures after recipe generation succeeds", async () => {
    const recipe = createCraftingRecipe({
      "crafting.1": createItem("minecraft:stone"),
      "crafting.result": createItem("minecraft:stone_button"),
    });
    const slotContext = createEmptySlotContext(MinecraftVersion.V121);

    generate.mockReturnValue(generatedRecipe);
    createDatapackBlob.mockImplementation(() => {
      throw new Error("Zip failed");
    });

    const result = await downloadDatapack([recipe], MinecraftVersion.V121, {
      tags: [],
      context: { bedrockNamespace: "crafting" },
      slotContext,
    });

    expect(result).toEqual({ status: "error" });
    expect(globalThis.alert).toHaveBeenCalledWith("Failed to generate the datapack:\n\nZip failed");
    expect(downloadBlob).not.toHaveBeenCalled();
  });
});
