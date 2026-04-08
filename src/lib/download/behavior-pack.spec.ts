import { beforeEach, describe, expect, it, vi } from "vitest";

import { MinecraftVersion, RecipeType } from "@/data/types";
import { createEmptySlotContext } from "@/stores/recipe/slot-value";
import { recipeStateDefaults } from "@/stores/recipe/types";
import { makeRecipe } from "@/test/recipe-fixtures";

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

vi.mock("@/recipes/generate", () => ({
  generate,
}));

import { downloadBehaviorPack } from "./behavior-pack";

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

describe("downloadBehaviorPack", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("alert", vi.fn());
  });

  it("blocks behavior pack download when any recipe is incomplete", async () => {
    const recipe = createCraftingRecipe({
      "crafting.1": createItem("minecraft:stone"),
    });
    const slotContext = createEmptySlotContext(MinecraftVersion.Bedrock);

    await downloadBehaviorPack({
      recipes: [recipe],
      version: MinecraftVersion.Bedrock,
      context: { bedrockNamespace: "crafting" },
      slotContext,
    });

    expect(globalThis.alert).toHaveBeenCalledWith(
      "Please finish all recipes before downloading the behavior pack:\n\n- Crafting Recipe: Add a result item",
    );
    expect(generate).not.toHaveBeenCalled();
    expect(createBehaviorPackBlob).not.toHaveBeenCalled();
    expect(downloadBlob).not.toHaveBeenCalled();
  });

  it("blocks behavior pack download when manual identifier names collide", async () => {
    const firstRecipe = createCraftingRecipe(
      {
        "crafting.1": createItem("minecraft:stone"),
        "crafting.result": createItem("minecraft:stone_button"),
      },
      {
        bedrock: { identifierMode: "manual", identifierName: "duplicate", priority: 0 },
      },
    );
    const secondRecipe = createCraftingRecipe(
      {
        "crafting.1": createItem("minecraft:oak_planks"),
        "crafting.result": createItem("minecraft:stick"),
      },
      {
        bedrock: { identifierMode: "manual", identifierName: "duplicate", priority: 0 },
      },
    );
    const slotContext = createEmptySlotContext(MinecraftVersion.Bedrock);

    await downloadBehaviorPack({
      recipes: [firstRecipe, secondRecipe],
      version: MinecraftVersion.Bedrock,
      context: { bedrockNamespace: "crafting" },
      slotContext,
    });

    expect(globalThis.alert).toHaveBeenCalledWith(
      "Please finish all recipes before downloading the behavior pack:\n\n- stone_button: Duplicate Bedrock identifier: crafting:duplicate\n- stick: Duplicate Bedrock identifier: crafting:duplicate",
    );
    expect(createBehaviorPackBlob).not.toHaveBeenCalled();
    expect(downloadBlob).not.toHaveBeenCalled();
  });

  it("blocks behavior pack download when an identifier has invalid syntax", async () => {
    const recipe = createCraftingRecipe(
      {
        "crafting.1": createItem("minecraft:stone"),
        "crafting.result": createItem("minecraft:stone_button"),
      },
      {
        bedrock: { identifierMode: "manual", identifierName: "Bad-Id", priority: 0 },
      },
    );
    const slotContext = createEmptySlotContext(MinecraftVersion.Bedrock);

    await downloadBehaviorPack({
      recipes: [recipe],
      version: MinecraftVersion.Bedrock,
      context: { bedrockNamespace: "Crafting" },
      slotContext,
    });

    expect(globalThis.alert).toHaveBeenCalledWith(
      "Please finish all recipes before downloading the behavior pack:\n\n- stone_button: Use a valid Bedrock identifier (namespace:name; a-z, 0-9, _)",
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
    const slotContext = createEmptySlotContext(MinecraftVersion.Bedrock);

    generate.mockReturnValue({ test: true });
    createBehaviorPackBlob.mockReturnValue(blob);

    await downloadBehaviorPack({
      recipes: [recipe],
      version: MinecraftVersion.Bedrock,
      context: { bedrockNamespace: "crafting" },
      slotContext,
    });

    expect(globalThis.alert).not.toHaveBeenCalled();
    expect(generate).toHaveBeenCalledWith({
      state: recipe,
      version: MinecraftVersion.Bedrock,
      slotContext,
      options: {
        bedrockIdentifier: "crafting:stone_button",
      },
    });
    expect(createBehaviorPackBlob).toHaveBeenCalledWith([
      { identifier: "crafting:stone_button", json: { test: true } },
    ]);
    expect(downloadBlob).toHaveBeenCalledWith(blob, "behavior_pack.mcpack");
  });

  it("surfaces generation failures after validation passes", async () => {
    const recipe = createCraftingRecipe({
      "crafting.1": createItem("minecraft:stone"),
      "crafting.result": createItem("minecraft:stone_button"),
    });
    const slotContext = createEmptySlotContext(MinecraftVersion.Bedrock);

    generate.mockImplementation(() => {
      throw new Error("Boom");
    });

    await downloadBehaviorPack({
      recipes: [recipe],
      version: MinecraftVersion.Bedrock,
      context: { bedrockNamespace: "crafting" },
      slotContext,
    });

    expect(globalThis.alert).toHaveBeenCalledWith(
      "Failed to generate all recipes for the behavior pack:\n\n- stone_button: Boom",
    );
    expect(createBehaviorPackBlob).not.toHaveBeenCalled();
    expect(downloadBlob).not.toHaveBeenCalled();
  });

  it("surfaces zip creation failures", async () => {
    const recipe = createCraftingRecipe({
      "crafting.1": createItem("minecraft:stone"),
      "crafting.result": createItem("minecraft:stone_button"),
    });
    const slotContext = createEmptySlotContext(MinecraftVersion.Bedrock);

    generate.mockReturnValue({ test: true });
    createBehaviorPackBlob.mockImplementation(() => {
      throw new Error("Zip failed");
    });

    await downloadBehaviorPack({
      recipes: [recipe],
      version: MinecraftVersion.Bedrock,
      context: { bedrockNamespace: "crafting" },
      slotContext,
    });

    expect(globalThis.alert).toHaveBeenCalledWith(
      "Failed to generate the behavior pack:\n\nZip failed",
    );
    expect(downloadBlob).not.toHaveBeenCalled();
  });
});
