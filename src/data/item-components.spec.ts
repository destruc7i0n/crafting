import { describe, expect, it } from "vitest";

import {
  cloneItemComponents,
  getPotionContents,
  normalizeItemComponents,
  withPotionContents,
} from "./item-components";

const healing = { "minecraft:potion_contents": { potion: "minecraft:healing" } };

describe("item components", () => {
  it("normalizes named potion contents, including unknown and unnamespaced ids", () => {
    expect(normalizeItemComponents(healing)).toEqual(healing);
    expect(normalizeItemComponents({ "minecraft:potion_contents": { potion: "future" } })).toEqual({
      "minecraft:potion_contents": { potion: "future" },
    });
    expect(normalizeItemComponents({})).toBeUndefined();
  });

  it("rejects anything outside the supported shape", () => {
    for (const raw of [
      null,
      [],
      "minecraft:healing",
      Object.create(null),
      { "minecraft:potion_contents": {} },
      { "minecraft:potion_contents": [] },
      { "minecraft:potion_contents": { potion: "minecraft:healing", custom_color: 1 } },
      { "minecraft:potion_contents": { potion: "Minecraft:Healing" } },
      { ...healing, "minecraft:lore": [] },
      { "!minecraft:potion_contents": {} },
    ]) {
      expect(normalizeItemComponents(raw)).toBeNull();
    }
  });

  it("is idempotent and clones without sharing nested objects", () => {
    const normalized = normalizeItemComponents(healing)!;
    expect(normalizeItemComponents(normalized)).toEqual(normalized);

    const clone = cloneItemComponents(normalized);
    expect(clone).toEqual(normalized);
    expect(clone["minecraft:potion_contents"]).not.toBe(normalized["minecraft:potion_contents"]);
  });

  it("reads and updates potion contents without touching the input", () => {
    expect(getPotionContents(healing)).toBe("minecraft:healing");
    expect(getPotionContents(undefined)).toBeUndefined();

    const swiftness = withPotionContents(healing, "minecraft:swiftness");
    expect(swiftness).toEqual({ "minecraft:potion_contents": { potion: "minecraft:swiftness" } });
    expect(healing["minecraft:potion_contents"].potion).toBe("minecraft:healing");
    expect(withPotionContents(healing, undefined)).toBeUndefined();
    expect(withPotionContents(undefined, "minecraft:water")).toEqual({
      "minecraft:potion_contents": { potion: "minecraft:water" },
    });
  });
});
