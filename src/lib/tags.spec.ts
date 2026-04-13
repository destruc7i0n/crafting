import { describe, expect, it } from "vitest";

import { Tag, TagValue } from "@/data/models/types";
import { MinecraftVersion } from "@/data/types";

import {
  createEmptyTag,
  createTagItem,
  hasDuplicateTagId,
  isSameIngredient,
  resolveTagValues,
} from "./tags";

describe("resolveTagValues", () => {
  const makeItemValue = (id: string): TagValue => ({
    type: "item",
    id: { namespace: "minecraft", id },
  });

  const makeTagValue = (ns: string, id: string): TagValue => ({
    type: "tag",
    id: { namespace: ns, id },
  });

  it("resolves simple item values", () => {
    const values: TagValue[] = [makeItemValue("stone"), makeItemValue("dirt")];

    const result = resolveTagValues(values, [], {});

    expect(result).toEqual(["minecraft:stone", "minecraft:dirt"]);
  });

  it("deduplicates resolved values", () => {
    const values: TagValue[] = [makeItemValue("stone"), makeItemValue("stone")];

    const result = resolveTagValues(values, [], {});

    expect(result).toEqual(["minecraft:stone"]);
  });

  it("resolves vanilla tag references", () => {
    const values: TagValue[] = [makeTagValue("minecraft", "logs")];
    const vanillaTags = {
      "minecraft:logs": ["minecraft:oak_log", "minecraft:birch_log"],
    };

    const result = resolveTagValues(values, [], vanillaTags);

    expect(result).toEqual(["minecraft:oak_log", "minecraft:birch_log"]);
  });

  it("resolves custom tag references", () => {
    const customTag: Tag = {
      uid: "tag-1",
      id: "crafting:my_tag",
      values: [makeItemValue("diamond"), makeItemValue("emerald")],
    };
    const values: TagValue[] = [makeTagValue("crafting", "my_tag")];

    const result = resolveTagValues(values, [customTag], {});

    expect(result).toEqual(["minecraft:diamond", "minecraft:emerald"]);
  });

  it("handles circular tag references gracefully", () => {
    const tagA: Tag = {
      uid: "a",
      id: "crafting:tag_a",
      values: [makeTagValue("crafting", "tag_b")],
    };
    const tagB: Tag = {
      uid: "b",
      id: "crafting:tag_b",
      values: [makeTagValue("crafting", "tag_a"), makeItemValue("stone")],
    };

    const values: TagValue[] = [makeTagValue("crafting", "tag_a")];
    const result = resolveTagValues(values, [tagA, tagB], {});

    expect(result).toEqual(["minecraft:stone"]);
  });

  it("returns empty for unknown tag references", () => {
    const values: TagValue[] = [makeTagValue("minecraft", "nonexistent")];
    const result = resolveTagValues(values, [], {});
    expect(result).toEqual([]);
  });
});

describe("createEmptyTag", () => {
  it("creates a tag with incremented number", () => {
    const existing: Tag[] = [
      { uid: "1", id: "crafting:custom_tag_1", values: [] },
      { uid: "2", id: "crafting:custom_tag_3", values: [] },
    ];

    const tag = createEmptyTag(existing);

    expect(tag.id).toBe("crafting:custom_tag_4");
    expect(tag.values).toEqual([]);
    expect(tag.uid).toBeDefined();
  });

  it("starts from 1 when no existing tags match pattern", () => {
    const tag = createEmptyTag([]);
    expect(tag.id).toBe("crafting:custom_tag_1");
  });
});

describe("hasDuplicateTagId", () => {
  it("returns true for normalized duplicate tag ids", () => {
    const tags: Tag[] = [{ uid: "tag-1", id: "minecraft:duplicate", values: [] }];

    expect(hasDuplicateTagId(tags, "minecraft:duplicate")).toBe(true);
    expect(hasDuplicateTagId(tags, "duplicate")).toBe(true);
  });

  it("returns false when the matching tag uid is ignored", () => {
    const tags: Tag[] = [{ uid: "tag-1", id: "crafting:duplicate", values: [] }];

    expect(hasDuplicateTagId(tags, "crafting:duplicate", "tag-1")).toBe(false);
  });
});

describe("createTagItem", () => {
  it("creates a tag item with resolved texture", () => {
    const itemsById = {
      "minecraft:stone": {
        type: "default_item" as const,
        id: { namespace: "minecraft", id: "stone" },
        displayName: "Stone",
        texture: "stone.png",
        _version: MinecraftVersion.V121,
      },
    };

    const result = createTagItem({
      rawId: "minecraft:logs",
      values: ["minecraft:stone"],
      version: MinecraftVersion.V121,
      itemsById,
      tagSource: "vanilla",
    });

    expect(result.type).toBe("tag_item");
    expect(result.texture).toBe("stone.png");
    expect(result.displayName).toBe("#minecraft:logs");
    expect(result.tagSource).toBe("vanilla");
  });
});

describe("isSameIngredient", () => {
  it("returns false when either is undefined", () => {
    expect(isSameIngredient(undefined, undefined)).toBe(false);
  });

  it("returns true for same default items", () => {
    const item = {
      type: "default_item" as const,
      id: { namespace: "minecraft", id: "stone" },
      displayName: "Stone",
      texture: "stone.png",
      _version: MinecraftVersion.V121,
    };

    expect(isSameIngredient(item, { ...item })).toBe(true);
  });

  it("returns false for different types", () => {
    const item = {
      type: "default_item" as const,
      id: { namespace: "minecraft", id: "stone" },
      displayName: "Stone",
      texture: "stone.png",
      _version: MinecraftVersion.V121,
    };
    const customItem = {
      type: "custom_item" as const,
      uid: "uid-1",
      id: { namespace: "minecraft", id: "stone" },
      displayName: "Stone",
      texture: "stone.png",
      _version: MinecraftVersion.V121,
    };

    expect(isSameIngredient(item, customItem)).toBe(false);
  });

  it("matches custom items by uid", () => {
    const a = {
      type: "custom_item" as const,
      uid: "uid-1",
      id: { namespace: "minecraft", id: "stone" },
      displayName: "Stone",
      texture: "stone.png",
      _version: MinecraftVersion.V121,
    };
    const b = { ...a };

    expect(isSameIngredient(a, b)).toBe(true);
  });
});
