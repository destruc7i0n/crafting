import { describe, expect, it } from "vitest";

import { Tag, TagValue } from "@/data/models/types";
import { MinecraftVersion } from "@/data/types";

import {
  createEmptyTag,
  createTagItem,
  hasDuplicateTagId,
  isSameIngredient,
  normalizeTagValue,
  resolveTagValues,
  TagContext,
  toByUidMap,
  tagValueExportRef,
  tagValueKey,
  upgradeLegacyTagRefs,
} from "./tags";

const ctx = (allTags: Tag[] = [], vanillaTags: Record<string, string[]> = {}): TagContext => ({
  tagsByUid: toByUidMap(allTags),
  allTags,
  vanillaTags,
});

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

    const result = resolveTagValues(values, ctx([], {}));

    expect(result).toEqual(["minecraft:stone", "minecraft:dirt"]);
  });

  it("deduplicates resolved values", () => {
    const values: TagValue[] = [makeItemValue("stone"), makeItemValue("stone")];

    const result = resolveTagValues(values, ctx([], {}));

    expect(result).toEqual(["minecraft:stone"]);
  });

  it("resolves vanilla tag references", () => {
    const values: TagValue[] = [makeTagValue("minecraft", "logs")];
    const vanillaTags = {
      "minecraft:logs": ["minecraft:oak_log", "minecraft:birch_log"],
    };

    const result = resolveTagValues(values, ctx([], vanillaTags));

    expect(result).toEqual(["minecraft:oak_log", "minecraft:birch_log"]);
  });

  it("resolves custom tag references", () => {
    const customTag: Tag = {
      uid: "tag-1",
      id: "crafting:my_tag",
      values: [makeItemValue("diamond"), makeItemValue("emerald")],
    };
    const values: TagValue[] = [makeTagValue("crafting", "my_tag")];

    const result = resolveTagValues(values, ctx([customTag], {}));

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
    const result = resolveTagValues(values, ctx([tagA, tagB], {}));

    expect(result).toEqual(["minecraft:stone"]);
  });

  it("resolves the full union for every tag in a cycle", () => {
    const tagA: Tag = {
      uid: "a",
      id: "crafting:tag_a",
      values: [makeTagValue("crafting", "tag_b"), makeItemValue("iron_ingot")],
    };
    const tagB: Tag = {
      uid: "b",
      id: "crafting:tag_b",
      values: [makeTagValue("crafting", "tag_a"), makeItemValue("stone")],
    };

    const resultA = resolveTagValues([makeTagValue("crafting", "tag_a")], ctx([tagA, tagB]));
    const resultB = resolveTagValues([makeTagValue("crafting", "tag_b")], ctx([tagA, tagB]));

    expect(resultA.sort()).toEqual(["minecraft:iron_ingot", "minecraft:stone"]);
    expect(resultB.sort()).toEqual(["minecraft:iron_ingot", "minecraft:stone"]);
  });

  it("returns empty for unknown tag references", () => {
    const values: TagValue[] = [makeTagValue("minecraft", "nonexistent")];
    const result = resolveTagValues(values, ctx([], {}));
    expect(result).toEqual([]);
  });
});

describe("tagValueKey", () => {
  const itemValue: TagValue = { type: "item", id: { namespace: "minecraft", id: "stone" } };
  const tagValue: TagValue = { type: "tag", id: { namespace: "minecraft", id: "stone" } };

  it("namespaces by discriminant so an item and a tag with the same id are distinct", () => {
    expect(tagValueKey(itemValue)).toBe("item:minecraft:stone");
    expect(tagValueKey(tagValue)).toBe("tag:minecraft:stone");
    expect(tagValueKey(itemValue)).not.toBe(tagValueKey(tagValue));
  });

  it("ignores a data value, matching what export can emit", () => {
    const withData: TagValue = { type: "item", id: { namespace: "mymod", id: "gem", data: 1 } };

    expect(tagValueKey(withData)).toBe("item:mymod:gem");
    expect(normalizeTagValue(withData)).toEqual({
      type: "item",
      id: { namespace: "mymod", id: "gem" },
    });
  });

  it("keys uid arms on the uid, so a rename cannot change a value's identity", () => {
    expect(tagValueKey({ type: "custom_tag", uid: "ct-1" })).toBe("custom_tag:ct-1");
  });
});

describe("resolution and export agreement", () => {
  // a 1.13+ tag file cannot express a data value, so in-app resolution must not either
  it("resolves a data-suffixed value to the same string it exports", () => {
    const value: TagValue = { type: "item", id: { namespace: "mymod", id: "gem", data: 1 } };

    expect(resolveTagValues([value], ctx([], {}))).toEqual(["mymod:gem"]);
    expect(tagValueExportRef(value, ctx())).toBe("mymod:gem");
  });

  it("agrees for a value reached through a custom tag", () => {
    const tag: Tag = {
      uid: "tag-1",
      id: "crafting:gems",
      values: [{ type: "item", id: { namespace: "mymod", id: "gem", data: 1 } }],
    };
    const ref: TagValue = { type: "tag", id: { namespace: "crafting", id: "gems" } };

    expect(resolveTagValues([ref], ctx([tag], {}))).toEqual(["mymod:gem"]);
  });
});

describe("uid-referenced tag values", () => {
  const gems: Tag = {
    uid: "ct-1",
    id: "crafting:gems",
    values: [{ type: "item", id: { namespace: "minecraft", id: "diamond" } }],
  };

  it("resolves a custom_tag ref to the tag's members", () => {
    const value: TagValue = { type: "custom_tag", uid: "ct-1" };

    expect(resolveTagValues([value], ctx([gems]))).toEqual(["minecraft:diamond"]);
    expect(tagValueExportRef(value, ctx([gems]))).toBe("#crafting:gems");
  });

  it("follows a rename with no change to the stored value", () => {
    const value: TagValue = { type: "custom_tag", uid: "ct-1" };
    const renamed = { ...gems, id: "crafting:jewels" };

    expect(tagValueExportRef(value, ctx([renamed]))).toBe("#crafting:jewels");
  });

  it("emits nothing for a dangling uid rather than a broken ref", () => {
    const dangling: TagValue = { type: "custom_tag", uid: "gone" };

    expect(resolveTagValues([dangling], ctx([]))).toEqual([]);
    expect(tagValueExportRef(dangling, ctx([]))).toBeUndefined();
  });

  it("does not let a dangling sibling break the rest of a tag", () => {
    const values: TagValue[] = [
      { type: "custom_tag", uid: "gone" },
      { type: "item", id: { namespace: "minecraft", id: "stone" } },
    ];

    expect(resolveTagValues(values, ctx([]))).toEqual(["minecraft:stone"]);
  });

  it("keeps a dangling ref out of the tag graph so nesting still resolves", () => {
    const parent: Tag = {
      uid: "ct-2",
      id: "crafting:parent",
      values: [
        { type: "custom_tag", uid: "gone" },
        { type: "custom_tag", uid: "ct-1" },
      ],
    };
    const value: TagValue = { type: "custom_tag", uid: "ct-2" };

    expect(resolveTagValues([value], ctx([parent, gems]))).toEqual(["minecraft:diamond"]);
  });
});

describe("upgradeLegacyTagRefs", () => {
  const child: Tag = { uid: "tag-b", id: "crafting:child", values: [] };

  it("re-points an identifier ref at the referenced tag's uid", () => {
    const parent: Tag = {
      uid: "tag-a",
      id: "crafting:parent",
      values: [{ type: "tag", id: { namespace: "crafting", id: "child" } }],
    };

    expect(upgradeLegacyTagRefs([child, parent])[1]?.values).toEqual([
      { type: "custom_tag", uid: "tag-b" },
    ]);
  });

  it("leaves a ref to a vanilla tag alone", () => {
    const parent: Tag = {
      uid: "tag-a",
      id: "crafting:parent",
      values: [{ type: "tag", id: { namespace: "minecraft", id: "logs" } }],
    };

    expect(upgradeLegacyTagRefs([child, parent])[1]?.values).toEqual(parent.values);
  });

  it("leaves an item that shares a tag's id alone", () => {
    const parent: Tag = {
      uid: "tag-a",
      id: "crafting:parent",
      values: [{ type: "item", id: { namespace: "crafting", id: "child" } }],
    };

    expect(upgradeLegacyTagRefs([child, parent])[1]?.values).toEqual(parent.values);
  });

  it("is idempotent", () => {
    const parent: Tag = {
      uid: "tag-a",
      id: "crafting:parent",
      values: [{ type: "tag", id: { namespace: "crafting", id: "child" } }],
    };

    const once = upgradeLegacyTagRefs([child, parent]);
    expect(upgradeLegacyTagRefs(once)).toEqual(once);
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
