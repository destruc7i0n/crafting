import { TagContext } from "@/lib/tags";

import { generateTag } from "./tag";

const NO_REFS: TagContext = { tagsByUid: {}, allTags: [], vanillaTags: {} };

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
});
