import { describe, expect, it } from "vitest";

import { MinecraftVersion, RecipeType } from "@/data/types";

import {
  compareMinecraftVersions,
  getJavaPackMetadata,
  isVersionAtLeast,
  recipeTypeAvailability,
  supportsCustomTags,
  supportsItemTags,
  supportsRecipeCategory,
  supportsShowNotification,
  supportsSmithingTrimPattern,
  supportsVanillaTagList,
} from ".";
import { buildJava, extractCraftingInput } from "../recipes/generate/crafting";
import { createRecipeFormatter } from "../recipes/generate/format/recipe-formatter";
import { createEmptySlotContext } from "../stores/recipe/slot-value";
import { recipeStateDefaults } from "../stores/recipe/types";
import { makeRecipe } from "../test/recipe-fixtures";

describe("compareMinecraftVersions", () => {
  it("compares versions with different lengths", () => {
    expect(compareMinecraftVersions("1.21", "1.21.2")).toBe(-1);
    expect(compareMinecraftVersions("1.21.2", "1.21")).toBe(1);
  });

  it("compares equal versions", () => {
    expect(compareMinecraftVersions("1.21.2", "1.21.2")).toBe(0);
  });

  it("treats missing trailing segments as zero", () => {
    expect(compareMinecraftVersions("1.21", "1.21.0")).toBe(0);
    expect(compareMinecraftVersions("1.21.0", "1.21")).toBe(0);
  });

  it("compares higher and lower versions", () => {
    expect(compareMinecraftVersions("1.21.11", "1.21.2")).toBe(1);
    expect(compareMinecraftVersions("1.20", "1.21")).toBe(-1);
  });
});

describe("isVersionAtLeast", () => {
  it("returns true for same version", () => {
    expect(isVersionAtLeast(MinecraftVersion.V1212, MinecraftVersion.V1212)).toBe(true);
  });

  it("returns false when minimum is bedrock", () => {
    expect(isVersionAtLeast(MinecraftVersion.V121, MinecraftVersion.Bedrock)).toBe(false);
  });

  it("returns false for bedrock comparisons", () => {
    expect(isVersionAtLeast(MinecraftVersion.Bedrock, MinecraftVersion.V1212)).toBe(false);
  });

  it("returns expected values across versions", () => {
    expect(isVersionAtLeast(MinecraftVersion.V12111, MinecraftVersion.V1212)).toBe(true);
    expect(isVersionAtLeast(MinecraftVersion.V120, MinecraftVersion.V121)).toBe(false);
  });
});

describe("recipeTypeAvailability", () => {
  it("keeps the 1.19 smithing boundary", () => {
    expect(recipeTypeAvailability[RecipeType.Smithing]).toEqual({
      minVersion: MinecraftVersion.V116,
      maxVersion: MinecraftVersion.V119,
    });
  });

  it("keeps transmute disabled", () => {
    expect(recipeTypeAvailability[RecipeType.CraftingTransmute]).toEqual({
      minVersion: MinecraftVersion.V1212,
      enabled: false,
    });
  });
});

describe("recipe feature support", () => {
  it("supports recipe categories on 1.19 for supported recipe types", () => {
    expect(supportsRecipeCategory(MinecraftVersion.V119, RecipeType.Crafting)).toBe(true);
    expect(supportsRecipeCategory(MinecraftVersion.V119, RecipeType.Blasting)).toBe(true);
  });

  it("does not support recipe categories before 1.19 or on unsupported types", () => {
    expect(supportsRecipeCategory(MinecraftVersion.V118, RecipeType.Crafting)).toBe(false);
    expect(supportsRecipeCategory(MinecraftVersion.V119, RecipeType.Stonecutter)).toBe(false);
    expect(supportsRecipeCategory(MinecraftVersion.Bedrock, RecipeType.Crafting)).toBe(false);
  });

  it("starts shaped show_notification at 1.19", () => {
    expect(supportsShowNotification(MinecraftVersion.V119, RecipeType.Crafting, false)).toBe(true);
    expect(supportsShowNotification(MinecraftVersion.V118, RecipeType.Crafting, false)).toBe(false);
  });

  it("starts shapeless show_notification at 26.1", () => {
    expect(supportsShowNotification(MinecraftVersion.V119, RecipeType.Crafting, true)).toBe(false);
    expect(supportsShowNotification(MinecraftVersion.V261, RecipeType.Crafting, true)).toBe(true);
  });

  it("keeps smithing trim pattern gated to 1.21.5", () => {
    expect(supportsSmithingTrimPattern(MinecraftVersion.V1214)).toBe(false);
    expect(supportsSmithingTrimPattern(MinecraftVersion.V1215)).toBe(true);
    expect(supportsSmithingTrimPattern(MinecraftVersion.Bedrock)).toBe(false);
  });
});

describe("tag support", () => {
  it("starts item tags and custom tags at 1.13", () => {
    expect(supportsItemTags(MinecraftVersion.V112)).toBe(false);
    expect(supportsItemTags(MinecraftVersion.V113)).toBe(true);
    expect(supportsCustomTags(MinecraftVersion.V112)).toBe(false);
    expect(supportsCustomTags(MinecraftVersion.V113)).toBe(true);
  });

  it("keeps bedrock item tags but not custom tags", () => {
    expect(supportsItemTags(MinecraftVersion.Bedrock)).toBe(true);
    expect(supportsCustomTags(MinecraftVersion.Bedrock)).toBe(false);
  });

  it("starts the vanilla tag list at 1.14", () => {
    expect(supportsVanillaTagList(MinecraftVersion.V113)).toBe(false);
    expect(supportsVanillaTagList(MinecraftVersion.V114)).toBe(true);
    expect(supportsVanillaTagList(MinecraftVersion.Bedrock)).toBe(true);
  });
});

describe("getJavaPackMetadata", () => {
  it("matches the latest stable pack formats for old release lines", () => {
    expect(getJavaPackMetadata(MinecraftVersion.V118).packFormat).toBe(9);
    expect(getJavaPackMetadata(MinecraftVersion.V119).packFormat).toBe(12);
    expect(getJavaPackMetadata(MinecraftVersion.V120).packFormat).toBe(41);
  });

  it("uses old recipe and tag dirs before 1.21", () => {
    expect(getJavaPackMetadata(MinecraftVersion.V120)).toEqual({
      packFormat: 41,
      recipeDir: "recipes",
      tagDir: "tags/items",
    });
  });

  it("uses singular recipe and tag dirs on 1.21+", () => {
    expect(getJavaPackMetadata(MinecraftVersion.V121)).toEqual({
      packFormat: 48,
      recipeDir: "recipe",
      tagDir: "tags/item",
    });
  });

  it("keeps tuple pack formats for newer versions", () => {
    expect(getJavaPackMetadata(MinecraftVersion.V1219).packFormat).toEqual([88, 0]);
    expect(getJavaPackMetadata(MinecraftVersion.V12111).packFormat).toEqual([94, 1]);
    expect(getJavaPackMetadata(MinecraftVersion.V261).packFormat).toEqual([101, 1]);
  });

  it("throws for unsupported datapack versions", () => {
    expect(() => getJavaPackMetadata(MinecraftVersion.V112)).toThrow(
      "Datapacks are not supported for 1.12",
    );
  });
});

describe("show_notification regression", () => {
  it("keeps advanced options and generation aligned for shaped 1.19 recipes", () => {
    const version = MinecraftVersion.V119;
    const recipe = makeRecipe({
      ...recipeStateDefaults,
      recipeType: RecipeType.Crafting,
      group: "",
      showNotification: false,
      slots: {
        "crafting.1": {
          type: "default_item",
          id: { namespace: "minecraft", id: "stone" },
          displayName: "stone",
          texture: "",
          _version: version,
        },
        "crafting.result": {
          type: "default_item",
          id: { namespace: "minecraft", id: "stone_button" },
          displayName: "stone_button",
          texture: "",
          _version: version,
        },
      },
      crafting: { ...recipeStateDefaults.crafting, shapeless: false, keepWhitespace: false },
      cooking: { time: 0, experience: 0 },
    });

    const generated = buildJava({
      state: extractCraftingInput(recipe),
      formatter: createRecipeFormatter(version),
      version,
      slotContext: createEmptySlotContext(version),
    });

    expect(supportsShowNotification(version, RecipeType.Crafting, false)).toBe(true);
    expect(generated).toMatchObject({ show_notification: false });
  });
});
