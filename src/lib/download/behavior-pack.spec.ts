import { beforeEach, describe, expect, it, vi } from "vitest";

import { SingleRecipeState } from "@/stores/recipe";

import { MinecraftVersion, RecipeType } from "@/data/types";

const { createBehaviorPackBlob, downloadBlob, generate, getBehaviorPackRecipeFileName } =
  vi.hoisted(() => ({
    createBehaviorPackBlob: vi.fn(),
    downloadBlob: vi.fn(),
    generate: vi.fn(),
    getBehaviorPackRecipeFileName: vi.fn((identifier: string) => {
      const sanitized =
        identifier
          .trim()
          .replace(/[:/\\]+/g, "_")
          .replace(/[^a-zA-Z0-9._-]+/g, "_")
          .replace(/^_+|_+$/g, "") || "recipe";

      return `${sanitized}.json`;
    }),
  }));

vi.mock("@/data/behavior-pack", () => ({
  createBehaviorPackBlob,
  getBehaviorPackRecipeFileName,
}));

vi.mock("@/data/datapack", () => ({
  downloadBlob,
}));

vi.mock("@/data/generate", () => ({
  generate,
}));

import { downloadBehaviorPack } from "./behavior-pack";

const createItem = (raw: string, version = MinecraftVersion.Bedrock) => ({
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
  identifier = "crafting:recipe_1",
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
  bedrock: {
    identifier,
    priority: 0,
  },
});

describe("downloadBehaviorPack", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("alert", vi.fn());
  });

  it("blocks behavior pack download when any recipe is incomplete", async () => {
    const recipe = createCraftingRecipe({
      "crafting.1": createItem("minecraft:stone"),
    });

    await downloadBehaviorPack([recipe], MinecraftVersion.Bedrock);

    expect(globalThis.alert).toHaveBeenCalledWith(
      "Please finish all recipes before downloading the behavior pack:\n\n- recipe_1: Add a result item",
    );
    expect(generate).not.toHaveBeenCalled();
    expect(createBehaviorPackBlob).not.toHaveBeenCalled();
    expect(downloadBlob).not.toHaveBeenCalled();
  });

  it("blocks behavior pack download when identifiers are duplicated", async () => {
    const firstRecipe = createCraftingRecipe(
      {
        "crafting.1": createItem("minecraft:stone"),
        "crafting.result": createItem("minecraft:stone_button"),
      },
      "crafting:duplicate",
      "recipe_1",
    );
    const secondRecipe = createCraftingRecipe(
      {
        "crafting.1": createItem("minecraft:oak_planks"),
        "crafting.result": createItem("minecraft:stick"),
      },
      "crafting:duplicate",
      "recipe_2",
    );

    await downloadBehaviorPack([firstRecipe, secondRecipe], MinecraftVersion.Bedrock);

    expect(globalThis.alert).toHaveBeenCalledWith(
      "Please finish all recipes before downloading the behavior pack:\n\n- recipe_1: Duplicate Bedrock identifier: crafting:duplicate\n- recipe_2: Duplicate Bedrock identifier: crafting:duplicate",
    );
    expect(createBehaviorPackBlob).not.toHaveBeenCalled();
    expect(downloadBlob).not.toHaveBeenCalled();
  });

  it("blocks behavior pack download when identifiers collide after filename sanitization", async () => {
    const firstRecipe = createCraftingRecipe(
      {
        "crafting.1": createItem("minecraft:stone"),
        "crafting.result": createItem("minecraft:stone_button"),
      },
      "crafting:foo/bar",
      "recipe_1",
    );
    const secondRecipe = createCraftingRecipe(
      {
        "crafting.1": createItem("minecraft:oak_planks"),
        "crafting.result": createItem("minecraft:stick"),
      },
      "crafting:foo_bar",
      "recipe_2",
    );

    await downloadBehaviorPack([firstRecipe, secondRecipe], MinecraftVersion.Bedrock);

    expect(globalThis.alert).toHaveBeenCalledWith(
      "Please finish all recipes before downloading the behavior pack:\n\n- recipe_1: Behavior pack filename collision: crafting_foo_bar.json\n- recipe_2: Behavior pack filename collision: crafting_foo_bar.json",
    );
    expect(createBehaviorPackBlob).not.toHaveBeenCalled();
    expect(downloadBlob).not.toHaveBeenCalled();
  });

  it("downloads the behavior pack when all recipes are valid", async () => {
    const blob = new Blob(["zip"]);
    const recipe = createCraftingRecipe({
      "crafting.1": createItem("minecraft:stone"),
      "crafting.result": createItem("minecraft:stone_button"),
    });

    generate.mockReturnValue({ test: true });
    createBehaviorPackBlob.mockResolvedValue(blob);

    await downloadBehaviorPack([recipe], MinecraftVersion.Bedrock);

    expect(globalThis.alert).not.toHaveBeenCalled();
    expect(generate).toHaveBeenCalledWith(recipe, MinecraftVersion.Bedrock);
    expect(createBehaviorPackBlob).toHaveBeenCalledWith([
      { identifier: "crafting:recipe_1", json: { test: true } },
    ]);
    expect(downloadBlob).toHaveBeenCalledWith(blob, "behavior_pack.mcpack");
  });

  it("surfaces generation failures after validation passes", async () => {
    const recipe = createCraftingRecipe({
      "crafting.1": createItem("minecraft:stone"),
      "crafting.result": createItem("minecraft:stone_button"),
    });

    generate.mockImplementation(() => {
      throw new Error("Boom");
    });

    await downloadBehaviorPack([recipe], MinecraftVersion.Bedrock);

    expect(globalThis.alert).toHaveBeenCalledWith(
      "Failed to generate all recipes for the behavior pack:\n\n- recipe_1: Boom",
    );
    expect(createBehaviorPackBlob).not.toHaveBeenCalled();
    expect(downloadBlob).not.toHaveBeenCalled();
  });

  it("surfaces zip creation failures", async () => {
    const recipe = createCraftingRecipe({
      "crafting.1": createItem("minecraft:stone"),
      "crafting.result": createItem("minecraft:stone_button"),
    });

    generate.mockReturnValue({ test: true });
    createBehaviorPackBlob.mockRejectedValue(new Error("Zip failed"));

    await downloadBehaviorPack([recipe], MinecraftVersion.Bedrock);

    expect(globalThis.alert).toHaveBeenCalledWith(
      "Failed to generate the behavior pack:\n\nZip failed",
    );
    expect(downloadBlob).not.toHaveBeenCalled();
  });
});
