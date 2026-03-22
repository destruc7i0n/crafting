import { MinecraftVersion } from "@/data/types";

import { createFormatStrategy } from "./item-formatter";

const id112 = { namespace: "minecraft", id: "stone", data: 1 };
const id = { namespace: "minecraft", id: "stone" };

describe("createFormatStrategy", () => {
  it("formats 1.12 ingredients/results", () => {
    const formatter = createFormatStrategy(MinecraftVersion.V112);

    expect(formatter.ingredient(id112)).toEqual({ item: "stone", data: 1 });
    expect(formatter.objectResult(id112, 2)).toEqual({
      item: "stone",
      data: 1,
      count: 2,
    });
    expect(formatter.recipeType("crafting_shaped")).toBe("crafting_shaped");
  });

  it("throws for 1.12 ingredientTag (tags not supported)", () => {
    const formatter = createFormatStrategy(MinecraftVersion.V112);

    expect(() => formatter.ingredientTag("minecraft:logs")).toThrow(
      "Item tags are not supported in Java 1.12",
    );
  });

  it("formats 1.14 ingredients/results", () => {
    const formatter = createFormatStrategy(MinecraftVersion.V114);

    expect(formatter.ingredient(id)).toEqual({ item: "minecraft:stone" });
    expect(formatter.ingredientTag("minecraft:logs")).toEqual({ tag: "minecraft:logs" });
    expect(formatter.objectResult(id, 2)).toEqual({
      item: "minecraft:stone",
      count: 2,
    });
    expect(formatter.recipeType("crafting_shaped")).toBe("minecraft:crafting_shaped");
    expect(formatter.cookingResult(id, 2)).toBe("minecraft:stone");
    expect(formatter.stonecutterResult(id, 2)).toEqual({
      result: "minecraft:stone",
      count: 2,
    });
  });

  it("formats 1.21 result ids", () => {
    const formatter = createFormatStrategy(MinecraftVersion.V121);

    expect(formatter.ingredient(id)).toEqual({ item: "minecraft:stone" });
    expect(formatter.objectResult(id, 2)).toEqual({ id: "minecraft:stone", count: 2 });
    expect(formatter.cookingResult(id, 2)).toEqual({ id: "minecraft:stone", count: 2 });
    expect(formatter.stonecutterResult(id, 2)).toEqual({
      result: { id: "minecraft:stone", count: 2 },
    });
  });

  it("formats 1.21.2 string ingredients", () => {
    const formatter = createFormatStrategy(MinecraftVersion.V1212);

    expect(formatter.ingredient(id)).toBe("minecraft:stone");
    expect(formatter.ingredientTag("minecraft:logs")).toBe("#minecraft:logs");
  });

  it("formats bedrock item refs", () => {
    const formatter = createFormatStrategy(MinecraftVersion.Bedrock);

    expect(formatter.ingredient(id112)).toEqual({ item: "minecraft:stone", data: 1 });
    expect(formatter.ingredientTag("minecraft:logs")).toEqual({
      tag: "minecraft:logs",
    });
    expect(formatter.objectResult(id112, 3)).toEqual({
      item: "minecraft:stone",
      data: 1,
      count: 3,
    });
    expect(formatter.cookingResult(id112, 3)).toEqual({
      item: "minecraft:stone",
      data: 1,
      count: 3,
    });
    expect(formatter.stonecutterResult(id112, 3)).toEqual({
      result: { item: "minecraft:stone", data: 1, count: 3 },
    });
  });
});
