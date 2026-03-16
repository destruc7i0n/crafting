import { beforeEach, describe, expect, it, vi } from "vitest";

import { SingleRecipeState } from "@/stores/recipe";

import { MinecraftVersion, RecipeType } from "@/data/types";

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

const createItem = (raw: string, version = MinecraftVersion.V121) => ({
  type: "default_item" as const,
  id: {
    raw,
    id: raw.split(":").at(-1) ?? raw,
    namespace: raw.includes(":") ? raw.split(":")[0] : "minecraft",
  },
  displayName: raw,
  texture: "",
  _version: version,
});

const createCraftingRecipe = (
  slots: SingleRecipeState["slots"],
  recipeName = "recipe_1",
): SingleRecipeState => ({
  recipeType: RecipeType.Crafting,
  recipeName,
  group: "",
  slots,
  crafting: {
    shapeless: true,
    keepWhitespace: false,
    twoByTwo: false,
  },
  cooking: {
    time: 0,
    experience: 0,
  },
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

    await downloadDatapack([recipe], MinecraftVersion.V112, []);

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

    await downloadDatapack([recipe], MinecraftVersion.V121, []);

    expect(globalThis.alert).toHaveBeenCalledWith(
      "Please finish all recipes before downloading the datapack:\n\n- recipe_1: Add a result item",
    );
    expect(generate).not.toHaveBeenCalled();
    expect(createDatapackBlob).not.toHaveBeenCalled();
    expect(downloadBlob).not.toHaveBeenCalled();
  });

  it("blocks datapack download when a recipe is missing a file name", async () => {
    const recipe = createCraftingRecipe(
      {
        "crafting.1": createItem("minecraft:stone"),
        "crafting.result": createItem("minecraft:stone_button"),
      },
      "",
    );

    await downloadDatapack([recipe], MinecraftVersion.V121, []);

    expect(globalThis.alert).toHaveBeenCalledWith(
      "Please finish all recipes before downloading the datapack:\n\n- (unnamed): Add a file name",
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

    generate.mockReturnValue({ test: true });
    createDatapackBlob.mockResolvedValue(blob);

    await downloadDatapack([recipe], MinecraftVersion.V121, []);

    expect(globalThis.alert).not.toHaveBeenCalled();
    expect(generate).toHaveBeenCalledWith(recipe, MinecraftVersion.V121);
    expect(createDatapackBlob).toHaveBeenCalledWith(
      MinecraftVersion.V121,
      [{ name: "recipe_1", json: { test: true } }],
      [],
    );
    expect(downloadBlob).toHaveBeenCalledWith(blob, "datapack.zip");
  });

  it("surfaces generation failures after validation passes", async () => {
    const recipe = createCraftingRecipe({
      "crafting.1": createItem("minecraft:stone"),
      "crafting.result": createItem("minecraft:stone_button"),
    });

    generate.mockImplementation(() => {
      throw new Error("Boom");
    });

    await downloadDatapack([recipe], MinecraftVersion.V121, []);

    expect(globalThis.alert).toHaveBeenCalledWith(
      "Failed to generate all recipes for the datapack:\n\n- recipe_1: Boom",
    );
    expect(createDatapackBlob).not.toHaveBeenCalled();
    expect(downloadBlob).not.toHaveBeenCalled();
  });
});
