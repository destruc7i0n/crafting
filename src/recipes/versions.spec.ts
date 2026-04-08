import { describe, expect, it } from "vitest";

import { MinecraftVersion, RecipeType } from "@/data/types";
import {
  coerceRecipeTypeForVersion,
  getSupportedRecipeTypesForVersion,
} from "@/recipes/definitions";

describe("getSupportedRecipeTypesForVersion", () => {
  it("1.12 only supports crafting", () => {
    expect(getSupportedRecipeTypesForVersion(MinecraftVersion.V112)).toEqual([RecipeType.Crafting]);
  });

  it("1.13 adds smelting", () => {
    const types = getSupportedRecipeTypesForVersion(MinecraftVersion.V113);
    expect(types).toContain(RecipeType.Crafting);
    expect(types).toContain(RecipeType.Smelting);
    expect(types).toHaveLength(2);
  });

  it("1.14 adds cooking variants, stonecutter", () => {
    const types = getSupportedRecipeTypesForVersion(MinecraftVersion.V114);
    expect(types).toContain(RecipeType.Blasting);
    expect(types).toContain(RecipeType.CampfireCooking);
    expect(types).toContain(RecipeType.Smoking);
    expect(types).toContain(RecipeType.Stonecutter);
    expect(types).not.toContain(RecipeType.Smithing);
  });

  it("1.15 does not yet have legacy smithing", () => {
    expect(getSupportedRecipeTypesForVersion(MinecraftVersion.V115)).not.toContain(
      RecipeType.Smithing,
    );
  });

  it("1.17 has legacy smithing", () => {
    expect(getSupportedRecipeTypesForVersion(MinecraftVersion.V117)).toContain(RecipeType.Smithing);
  });

  it("1.16 adds legacy smithing", () => {
    const types = getSupportedRecipeTypesForVersion(MinecraftVersion.V116);
    expect(types).toContain(RecipeType.Smithing);
    expect(types).not.toContain(RecipeType.SmithingTransform);
  });

  it("1.18 still has legacy smithing", () => {
    expect(getSupportedRecipeTypesForVersion(MinecraftVersion.V118)).toContain(RecipeType.Smithing);
  });

  it("1.19 replaces legacy smithing with transform/trim", () => {
    const types = getSupportedRecipeTypesForVersion(MinecraftVersion.V119);
    expect(types).not.toContain(RecipeType.Smithing);
    expect(types).toContain(RecipeType.SmithingTransform);
    expect(types).toContain(RecipeType.SmithingTrim);
  });

  it("latest version has modern recipe types", () => {
    const types = getSupportedRecipeTypesForVersion(MinecraftVersion.V12111);
    expect(types).toContain(RecipeType.SmithingTransform);
    expect(types).toContain(RecipeType.SmithingTrim);
    expect(types).not.toContain(RecipeType.Smithing);
  });

  it("Bedrock supports smithing transform/trim", () => {
    const types = getSupportedRecipeTypesForVersion(MinecraftVersion.Bedrock);
    expect(types).toContain(RecipeType.SmithingTransform);
    expect(types).toContain(RecipeType.SmithingTrim);
    expect(types).not.toContain(RecipeType.Smithing);
  });
});

describe("coerceRecipeTypeForVersion", () => {
  it("returns same type when supported", () => {
    expect(coerceRecipeTypeForVersion(RecipeType.Smelting, MinecraftVersion.V114)).toBe(
      RecipeType.Smelting,
    );
  });

  it("falls back to first supported type when unsupported", () => {
    expect(coerceRecipeTypeForVersion(RecipeType.Smelting, MinecraftVersion.V112)).toBe(
      RecipeType.Crafting,
    );
  });

  it("falls back to first supported type when undefined", () => {
    expect(coerceRecipeTypeForVersion(undefined, MinecraftVersion.V121)).toBe(RecipeType.Crafting);
  });
});
