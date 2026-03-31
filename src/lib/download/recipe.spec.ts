import { beforeEach, describe, expect, it, vi } from "vitest";

import { MinecraftVersion, RecipeType } from "@/data/types";
import { SingleRecipeState, recipeStateDefaults } from "@/stores/recipe";

const { downloadBlob, generate } = vi.hoisted(() => ({
  downloadBlob: vi.fn(),
  generate: vi.fn(),
}));

vi.mock("@/data/datapack", () => ({
  downloadBlob,
}));

vi.mock("@/data/generate", () => ({
  generate,
}));

import { downloadRecipeJson } from "./recipe";

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
  slots: SingleRecipeState["slots"],
  overrides: Partial<SingleRecipeState> = {},
): SingleRecipeState => ({
  ...recipeStateDefaults,
  id: overrides.id ?? `recipe-${(recipeId += 1)}`,
  recipeType: RecipeType.Crafting,
  slots,
  crafting: { ...recipeStateDefaults.crafting, shapeless: true },
  ...overrides,
});

describe("downloadRecipeJson", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("alert", vi.fn());
  });

  it("blocks Java download when a manual file name is blank", () => {
    const recipe = createCraftingRecipe(
      {
        "crafting.1": createItem("minecraft:stone"),
        "crafting.result": createItem("minecraft:stone_button"),
      },
      { nameMode: "manual", name: "" },
    );

    downloadRecipeJson(recipe, MinecraftVersion.V121, "stone_button.json");

    expect(globalThis.alert).toHaveBeenCalledWith("Add a file name before downloading JSON.");
    expect(generate).not.toHaveBeenCalled();
    expect(downloadBlob).not.toHaveBeenCalled();
  });

  it("uses the provided Java filename directly", () => {
    const recipe = createCraftingRecipe({
      "crafting.1": createItem("minecraft:stone"),
      "crafting.result": createItem("minecraft:stone_button"),
    });

    generate.mockReturnValue({ test: true });

    downloadRecipeJson(recipe, MinecraftVersion.V121, "stone_button.json");

    expect(generate).toHaveBeenCalledWith(recipe, MinecraftVersion.V121, undefined);
    expect(downloadBlob).toHaveBeenCalledWith(expect.any(Blob), "stone_button.json");
  });

  it("blocks Bedrock download when a manual name is blank", () => {
    const recipe = createCraftingRecipe(
      {
        "crafting.1": createItem("minecraft:stone", MinecraftVersion.Bedrock),
        "crafting.result": createItem("minecraft:stone_button", MinecraftVersion.Bedrock),
      },
      {
        bedrock: { identifierMode: "manual", identifierName: "", priority: 0 },
      },
    );

    downloadRecipeJson(recipe, MinecraftVersion.Bedrock, "crafting:stone_button");

    expect(globalThis.alert).toHaveBeenCalledWith("Add a Bedrock name before downloading JSON.");
    expect(generate).not.toHaveBeenCalled();
    expect(downloadBlob).not.toHaveBeenCalled();
  });

  it("passes the resolved Bedrock identifier to generation", () => {
    const recipe = createCraftingRecipe(
      {
        "crafting.1": createItem("minecraft:stone", MinecraftVersion.Bedrock),
        "crafting.result": createItem("minecraft:stone_button", MinecraftVersion.Bedrock),
      },
      {
        bedrock: { identifierMode: "auto", identifierName: "", priority: 0 },
      },
    );

    generate.mockReturnValue({ test: true });

    downloadRecipeJson(recipe, MinecraftVersion.Bedrock, "crafting:stone_button_2");

    expect(generate).toHaveBeenCalledWith(recipe, MinecraftVersion.Bedrock, {
      bedrockIdentifier: "crafting:stone_button_2",
    });
    expect(downloadBlob).toHaveBeenCalledWith(expect.any(Blob), "crafting_stone_button_2.json");
  });
});
