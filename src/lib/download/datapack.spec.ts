import { beforeEach, describe, expect, it, vi } from "vitest";

import { MinecraftVersion, RecipeType } from "@/data/types";
import { createEmptySlotContext } from "@/stores/recipe/slot-value";
import { recipeStateDefaults } from "@/stores/recipe/types";
import { makeRecipe } from "@/test/recipe-fixtures";

const { createDatapackBlob, downloadBlob, generate } = vi.hoisted(() => ({
  createDatapackBlob: vi.fn(),
  downloadBlob: vi.fn(),
  generate: vi.fn(),
}));

vi.mock("@/data/datapack", () => ({
  createDatapackBlob,
  downloadBlob,
}));

vi.mock("@/data/generate", () => ({
  generate,
}));

import { downloadDatapack } from "./datapack";

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

    await downloadDatapack([recipe], MinecraftVersion.V112, {
      tags: [],
      context: { bedrockNamespace: "crafting" },
      slotContext,
    });

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

    await downloadDatapack([recipe], MinecraftVersion.V121, {
      tags: [],
      context: { bedrockNamespace: "crafting" },
      slotContext,
    });

    expect(globalThis.alert).toHaveBeenCalledWith(
      "Please finish all recipes before downloading the datapack:\n\n- Crafting Recipe: Add a result item",
    );
    expect(generate).not.toHaveBeenCalled();
    expect(createDatapackBlob).not.toHaveBeenCalled();
    expect(downloadBlob).not.toHaveBeenCalled();
  });

  it("blocks datapack download when a manual name is blank", async () => {
    const recipe = createCraftingRecipe(
      {
        "crafting.1": createItem("minecraft:stone"),
        "crafting.result": createItem("minecraft:stone_button"),
      },
      { nameMode: "manual", name: "" },
    );
    const slotContext = createEmptySlotContext(MinecraftVersion.V121);

    await downloadDatapack([recipe], MinecraftVersion.V121, {
      tags: [],
      context: { bedrockNamespace: "crafting" },
      slotContext,
    });

    expect(globalThis.alert).toHaveBeenCalledWith(
      "Please finish all recipes before downloading the datapack:\n\n- stone_button: Add a file name",
    );
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

    generate.mockReturnValue({ test: true });
    createDatapackBlob.mockReturnValue(blob);

    await downloadDatapack([recipe], MinecraftVersion.V121, {
      tags: [],
      context: { bedrockNamespace: "crafting" },
      slotContext,
    });

    expect(globalThis.alert).not.toHaveBeenCalled();
    expect(generate).toHaveBeenCalledWith({
      state: recipe,
      version: MinecraftVersion.V121,
      slotContext,
    });
    expect(createDatapackBlob).toHaveBeenCalledWith(
      MinecraftVersion.V121,
      [{ name: "stone_button", json: { test: true } }],
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

    await downloadDatapack([recipe], MinecraftVersion.V121, {
      tags: [],
      context: { bedrockNamespace: "crafting" },
      slotContext,
    });

    expect(globalThis.alert).toHaveBeenCalledWith(
      "Failed to generate all recipes for the datapack:\n\n- stone_button: Boom",
    );
    expect(createDatapackBlob).not.toHaveBeenCalled();
    expect(downloadBlob).not.toHaveBeenCalled();
  });
});
