import { CustomItem } from "@/data/models/types";
import { MinecraftVersion } from "@/data/types";
import { TagContext, toByUidMap } from "@/lib/tags";

import { generateTag } from "./tag";

const NO_REFS: TagContext = { customItemsByUid: {}, tagsByUid: {}, allTags: [], vanillaTags: {} };

const ruby: CustomItem = {
  type: "custom_item",
  uid: "ci-1",
  id: { namespace: "mymod", id: "ruby" },
  displayName: "Ruby",
  texture: "ruby.png",
  _version: MinecraftVersion.V12111,
};

const withRuby: TagContext = { ...NO_REFS, customItemsByUid: toByUidMap([ruby]) };

describe("generateTag", () => {
  it("maps mixed item and tag values into datapack tag output", () => {
    expect(
      generateTag(
        {
          uid: "tag-1",
          id: "crafting:mixed",
          values: [
            { type: "item", id: { namespace: "minecraft", id: "stone" } },
            { type: "tag", id: { namespace: "minecraft", id: "logs" } },
          ],
        },
        NO_REFS,
      ),
    ).toEqual({
      replace: false,
      values: ["minecraft:stone", "#minecraft:logs"],
    });
  });

  // custom items are authored ids the generator cannot know about — never filter to vanilla
  it("emits a non-vanilla identifier verbatim", () => {
    expect(
      generateTag(
        {
          uid: "tag-1",
          id: "crafting:gems",
          values: [{ type: "item", id: { namespace: "mymod", id: "ruby" } }],
        },
        NO_REFS,
      ),
    ).toEqual({
      replace: false,
      values: ["mymod:ruby"],
    });
  });

  it("drops a data value, which a 1.13+ tag file cannot express", () => {
    expect(
      generateTag(
        {
          uid: "tag-1",
          id: "crafting:gems",
          values: [{ type: "item", id: { namespace: "mymod", id: "gem", data: 1 } }],
        },
        NO_REFS,
      ),
    ).toEqual({
      replace: false,
      values: ["mymod:gem"],
    });
  });

  it("resolves a custom item ref to the item's current identifier", () => {
    expect(
      generateTag(
        { uid: "tag-1", id: "crafting:gems", values: [{ type: "custom_item", uid: "ci-1" }] },
        withRuby,
      ),
    ).toEqual({ replace: false, values: ["mymod:ruby"] });
  });

  // dropping it beats emitting a broken ref, and the editor already flags it as missing
  it("drops a custom item ref whose item no longer exists", () => {
    expect(
      generateTag(
        { uid: "tag-1", id: "crafting:gems", values: [{ type: "custom_item", uid: "gone" }] },
        NO_REFS,
      ),
    ).toEqual({ replace: false, values: [] });
  });

  // distinct values, same export ref - resolveTagValues dedupes in-app, so the file must agree
  it("emits one entry when two values share an export ref", () => {
    expect(
      generateTag(
        {
          uid: "tag-1",
          id: "crafting:gems",
          values: [
            { type: "custom_item", uid: "ci-1" },
            { type: "item", id: { namespace: "mymod", id: "ruby" } },
          ],
        },
        withRuby,
      ),
    ).toEqual({ replace: false, values: ["mymod:ruby"] });
  });
});
