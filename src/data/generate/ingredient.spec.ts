import { describe, expect, it } from "vitest";

import { MinecraftVersion } from "@/data/types";

import { createRecipeFormatter } from "./format/recipe-formatter";
import { formatIngredient, formatIngredientString } from "./ingredient";

describe("formatIngredient", () => {
  it("returns empty object for undefined item", () => {
    const formatter = createRecipeFormatter(MinecraftVersion.V121);
    expect(formatIngredient(undefined, formatter)).toEqual({});
  });

  it("formats a default item using the formatter", () => {
    const formatter = createRecipeFormatter(MinecraftVersion.V1212);
    const item = {
      type: "default_item" as const,
      id: { namespace: "minecraft", id: "stone" },
      displayName: "Stone",
      texture: "stone.png",
      _version: MinecraftVersion.V1212,
    };

    expect(formatIngredient(item, formatter)).toBe("minecraft:stone");
  });

  it("formats a tag item as a tag reference", () => {
    const formatter = createRecipeFormatter(MinecraftVersion.V1212);
    const tagItem = {
      type: "tag_item" as const,
      id: { namespace: "minecraft", id: "logs" },
      displayName: "#minecraft:logs",
      texture: "logs.png",
      _version: MinecraftVersion.V1212,
      tagSource: "vanilla" as const,
      values: [],
    };

    expect(formatIngredient(tagItem, formatter)).toBe("#minecraft:logs");
  });

  it("formats a 1.14 item ingredient with object format", () => {
    const formatter = createRecipeFormatter(MinecraftVersion.V114);
    const item = {
      type: "default_item" as const,
      id: { namespace: "minecraft", id: "stone" },
      displayName: "Stone",
      texture: "stone.png",
      _version: MinecraftVersion.V114,
    };

    expect(formatIngredient(item, formatter)).toEqual({ item: "minecraft:stone" });
  });
});

describe("formatIngredientString", () => {
  it("returns empty string for undefined", () => {
    expect(formatIngredientString(undefined)).toBe("");
  });

  it("returns raw id for default items", () => {
    const item = {
      type: "default_item" as const,
      id: { namespace: "minecraft", id: "stone" },
      displayName: "Stone",
      texture: "stone.png",
      _version: MinecraftVersion.V121,
    };

    expect(formatIngredientString(item)).toBe("minecraft:stone");
  });

  it("returns tag ref string for tag items", () => {
    const tagItem = {
      type: "tag_item" as const,
      id: { namespace: "minecraft", id: "logs" },
      displayName: "#minecraft:logs",
      texture: "logs.png",
      _version: MinecraftVersion.V121,
      tagSource: "vanilla" as const,
      values: [],
    };

    expect(formatIngredientString(tagItem)).toBe("#minecraft:logs");
  });
});
