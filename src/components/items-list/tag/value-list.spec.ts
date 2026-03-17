import { describe, expect, it } from "vitest";

import { Item, Tag, TagItem } from "@/data/models/types";
import { MinecraftVersion } from "@/data/types";

import { filterValueOptions } from "./value-list";

const makeItem = (id: string): Item => ({
  type: "default_item",
  id: { namespace: "minecraft", id },
  displayName: id,
  texture: `${id}.png`,
  _version: MinecraftVersion.V121,
});

const makeTagItem = (id: string, uid?: string): TagItem => ({
  type: "tag_item",
  id: { namespace: "minecraft", id },
  displayName: `#minecraft:${id}`,
  texture: `${id}.png`,
  _version: MinecraftVersion.V121,
  tagSource: "vanilla",
  values: [],
  uid,
});

const makeTag = (uid: string, id: string): Tag => ({ uid, id, values: [] });

describe("filterValueOptions", () => {
  it("returns all items and tags when search is empty", () => {
    const results = filterValueOptions("", [makeItem("stone")], [makeTagItem("logs")], [], {});
    expect(results).toHaveLength(2);
  });

  it("returns all items and tags when search is only whitespace", () => {
    const results = filterValueOptions("  ", [makeItem("stone")], [makeTagItem("logs")], [], {});
    expect(results).toHaveLength(2);
  });

  it("filters items by displayName", () => {
    const results = filterValueOptions("stone", [makeItem("stone"), makeItem("dirt")], [], [], {});
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ kind: "item" });
  });

  it("filters items by raw id", () => {
    const results = filterValueOptions("dirt", [makeItem("stone"), makeItem("dirt")], [], [], {});
    expect(results).toHaveLength(1);
  });

  it("filters tag items by displayName", () => {
    const results = filterValueOptions(
      "logs",
      [],
      [makeTagItem("logs"), makeTagItem("planks")],
      [],
      {},
    );
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ kind: "tag" });
  });

  it("includes custom tag items when no excludeTagUid", () => {
    const tag = makeTag("uid-1", "crafting:my_tag");
    const tagItem = makeTagItem("my_tag", "uid-1");
    const results = filterValueOptions("", [], [], [tag], { "uid-1": tagItem });
    expect(results).toHaveLength(1);
  });

  it("excludes the tag matching excludeTagUid", () => {
    const tag = makeTag("uid-1", "crafting:my_tag");
    const tagItem = makeTagItem("my_tag", "uid-1");
    const results = filterValueOptions("", [], [], [tag], { "uid-1": tagItem }, "uid-1");
    expect(results).toHaveLength(0);
  });

  it("includes other custom tags when excludeTagUid is set", () => {
    const tagA = makeTag("uid-a", "crafting:tag_a");
    const tagB = makeTag("uid-b", "crafting:tag_b");
    const itemA = makeTagItem("tag_a", "uid-a");
    const itemB = makeTagItem("tag_b", "uid-b");
    const results = filterValueOptions(
      "",
      [],
      [],
      [tagA, tagB],
      { "uid-a": itemA, "uid-b": itemB },
      "uid-a",
    );
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ kind: "tag", rawId: "minecraft:tag_b" });
  });

  it("skips custom tags with no matching customTagItems entry", () => {
    const tag = makeTag("uid-missing", "crafting:ghost_tag");
    const results = filterValueOptions("", [], [], [tag], {});
    expect(results).toHaveLength(0);
  });
});
