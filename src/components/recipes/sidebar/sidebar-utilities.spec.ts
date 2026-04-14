import { describe, expect, it } from "vitest";

import { MinecraftVersion, RecipeType } from "@/data/types";
import { resolveRecipeNames } from "@/recipes/naming";
import { createEmptySlotContext } from "@/stores/recipe/slot-value";
import { makeRecipe } from "@/test/recipe-fixtures";

import {
  buildSidebarPackState,
  buildSidebarRecipeRows,
  getRecipeDownloadTarget,
  getSidebarRecipeSummary,
} from "./sidebar-utilities";

const slotContext = createEmptySlotContext(MinecraftVersion.V121);

describe("getRecipeDownloadTarget", () => {
  it("uses the resolved Java file name for Java versions", () => {
    expect(
      getRecipeDownloadTarget(MinecraftVersion.V121, {
        javaName: "stone_button",
        bedrockIdentifier: "crafting:stone_button",
      }),
    ).toBe("stone_button.json");
  });

  it("uses the Bedrock identifier for Bedrock exports", () => {
    expect(
      getRecipeDownloadTarget(MinecraftVersion.Bedrock, {
        javaName: "stone_button",
        bedrockIdentifier: "crafting:stone_button",
      }),
    ).toBe("crafting:stone_button");
  });
});

describe("getSidebarRecipeSummary", () => {
  it("falls back to generic labels when a recipe has no resolved naming", () => {
    expect(getSidebarRecipeSummary(undefined, MinecraftVersion.V121)).toEqual({
      title: "Recipe",
      detail: "Recipe",
    });
  });

  it("returns the resolved sidebar title and export detail", () => {
    expect(
      getSidebarRecipeSummary(
        {
          sidebarTitle: "stone_button",
          javaName: "stone_button",
          bedrockIdentifier: "crafting:stone_button",
        },
        MinecraftVersion.Bedrock,
      ),
    ).toEqual({
      title: "stone_button",
      detail: "crafting:stone_button",
    });
  });
});

describe("buildSidebarRecipeRows", () => {
  it("keeps unsupported recipes and invalid recipes distinguishable", () => {
    const supportedRecipe = makeRecipe({
      id: "supported",
      recipeType: RecipeType.Crafting,
    });
    const invalidRecipe = makeRecipe({
      id: "invalid",
      recipeType: RecipeType.Crafting,
    });
    const unsupportedRecipe = makeRecipe({
      id: "unsupported",
      recipeType: RecipeType.SmithingTransform,
    });

    const resolvedNamesById = resolveRecipeNames(
      [supportedRecipe, invalidRecipe, unsupportedRecipe],
      { bedrockNamespace: "crafting" },
      slotContext,
    ).byId;

    const rows = buildSidebarRecipeRows({
      recipes: [supportedRecipe, invalidRecipe, unsupportedRecipe],
      selectedRecipeId: "invalid",
      resolvedNamesById,
      version: MinecraftVersion.V121,
      supportedRecipeTypes: [RecipeType.Crafting],
      invalidRecipesById: new Map([["invalid", ["Add a file name"]]]),
    });

    expect(rows[0]).toMatchObject({
      recipe: supportedRecipe,
      isSelected: false,
      isSupported: true,
      hasWarning: false,
      errors: undefined,
    });
    expect(rows[1]).toMatchObject({
      recipe: invalidRecipe,
      isSelected: true,
      isSupported: true,
      hasWarning: true,
      errors: ["Add a file name"],
    });
    expect(rows[2]).toMatchObject({
      recipe: unsupportedRecipe,
      isSelected: false,
      isSupported: false,
      hasWarning: true,
      errors: undefined,
    });
  });
});

describe("buildSidebarPackState", () => {
  it("builds the enabled Java pack state", () => {
    expect(buildSidebarPackState(MinecraftVersion.V121, 0)).toEqual({
      label: "Download Datapack",
      readyTitle: "Download Datapack",
      blockedTitle: "Fix all recipes before downloading",
      canDownload: true,
      invalidRecipeCountLabel: "0 invalid recipes",
    });
  });

  it("builds the blocked Bedrock pack state with singular copy", () => {
    expect(buildSidebarPackState(MinecraftVersion.Bedrock, 1)).toEqual({
      label: "Download Behavior Pack",
      readyTitle: "Download Behavior Pack",
      blockedTitle: "Fix all recipes before downloading",
      canDownload: false,
      invalidRecipeCountLabel: "1 invalid recipe",
    });
  });
});
