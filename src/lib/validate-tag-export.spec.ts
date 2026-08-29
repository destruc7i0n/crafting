import { describe, expect, it } from "vitest";

import { Tag } from "@/data/models/types";
import { TagContext, toByUidMap } from "@/lib/tags";

import { validateTagsForExport } from "./validate-tag-export";

const ctxFor = (tags: Tag[]): TagContext => ({
  customItemsByUid: {},
  tagsByUid: toByUidMap(tags),
  allTags: tags,
  vanillaTags: {},
});

describe("validateTagsForExport", () => {
  it("reports nothing for a tag whose refs all resolve", () => {
    const tags: Tag[] = [
      {
        uid: "tag-a",
        id: "crafting:a",
        values: [{ type: "item", id: { namespace: "minecraft", id: "stone" } }],
      },
    ];

    expect(validateTagsForExport(tags, ctxFor(tags))).toEqual([]);
  });

  it("reports a ref whose custom item was deleted", () => {
    const tags: Tag[] = [
      { uid: "tag-a", id: "crafting:a", values: [{ type: "custom_item", uid: "gone" }] },
    ];

    expect(validateTagsForExport(tags, ctxFor(tags))).toEqual([
      { tag: tags[0], name: "crafting:a", errors: ["Tag references a missing custom item"] },
    ]);
  });

  it("collapses repeated missing refs into one error", () => {
    const tags: Tag[] = [
      {
        uid: "tag-a",
        id: "crafting:a",
        values: [
          { type: "custom_item", uid: "gone" },
          { type: "custom_item", uid: "also-gone" },
        ],
      },
    ];

    expect(validateTagsForExport(tags, ctxFor(tags))[0]?.errors).toEqual([
      "Tag references a missing custom item",
    ]);
  });

  // in-app resolution truncates the recursion, so the preview looks fine while the files do not
  it("reports both members of a mutual cycle", () => {
    const tags: Tag[] = [
      { uid: "tag-a", id: "crafting:a", values: [{ type: "custom_tag", uid: "tag-b" }] },
      { uid: "tag-b", id: "crafting:b", values: [{ type: "custom_tag", uid: "tag-a" }] },
    ];

    expect(validateTagsForExport(tags, ctxFor(tags)).map((issue) => issue.name)).toEqual([
      "crafting:a",
      "crafting:b",
    ]);
  });

  it("does not report a tag that merely leads into a cycle", () => {
    const tags: Tag[] = [
      { uid: "tag-x", id: "crafting:x", values: [{ type: "custom_tag", uid: "tag-a" }] },
      { uid: "tag-a", id: "crafting:a", values: [{ type: "custom_tag", uid: "tag-b" }] },
      { uid: "tag-b", id: "crafting:b", values: [{ type: "custom_tag", uid: "tag-a" }] },
    ];

    expect(validateTagsForExport(tags, ctxFor(tags)).map((issue) => issue.name)).toEqual([
      "crafting:a",
      "crafting:b",
    ]);
  });
});
