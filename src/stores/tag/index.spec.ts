import { beforeEach, describe, expect, it } from "vitest";

import { generateTag } from "@/data/generate/tag";
import { parseStringToMinecraftIdentifier } from "@/data/models/identifier/utilities";
import { CustomItem, Tag, TagValue } from "@/data/models/types";
import { MinecraftVersion, RecipeType } from "@/data/types";
import {
  getDuplicateTagIdErrorMessage,
  resolveTagValues,
  TagContext,
  toByUidMap,
  toTagValue,
} from "@/lib/tags";
import { useRecipeStore } from "@/stores/recipe";

import { useTagStore } from "./index";

const ctx = (allTags: Tag[]): TagContext => ({
  customItemsByUid: {},
  tagsByUid: toByUidMap(allTags),
  allTags,
  vanillaTags: {},
});

const createItemValue = (id: string): TagValue => ({
  type: "item",
  id: parseStringToMinecraftIdentifier(id),
});

const createTagValue = (id: string): TagValue => ({
  type: "tag",
  id: parseStringToMinecraftIdentifier(id),
});

const itemValueId = (value: TagValue | undefined) =>
  value && (value.type === "item" || value.type === "tag") ? value.id : undefined;

const createTag = (uid: string, id: string, values: TagValue[] = []): Tag => ({
  uid,
  id,
  values,
});

describe("tag store", () => {
  beforeEach(() => {
    useTagStore.setState((state) => ({
      ...state,
      tags: [],
    }));

    useRecipeStore.setState((state) => ({
      ...state,
      recipes: [
        {
          id: "recipe-1",
          nameMode: "auto",
          name: "",
          recipeType: RecipeType.Crafting,
          group: "",
          category: "",
          showNotification: true,
          smithing: {
            trimPattern: "",
          },
          slots: {},
          crafting: {
            shapeless: false,
            keepWhitespace: false,
            twoByTwo: false,
          },
          cooking: {
            time: 0,
            experience: 0,
          },
          bedrock: {
            identifierMode: "auto",
            identifierName: "",
            priority: 0,
          },
        },
      ],
      selectedRecipeId: "recipe-1",
    }));
  });

  it("renames a tag without rewriting any other tag's values", () => {
    const parentTag = createTag("tag-a", "crafting:parent", [{ type: "custom_tag", uid: "tag-b" }]);
    const childTag = createTag("tag-b", "crafting:child", [createItemValue("minecraft:stone")]);
    const mixedParentTag = createTag("tag-c", "crafting:mixed_parent", [
      createItemValue("minecraft:dirt"),
      { type: "custom_tag", uid: "tag-b" },
      { type: "custom_tag", uid: "tag-d" },
    ]);
    const otherChildTag = createTag("tag-d", "crafting:other_child");

    useTagStore.setState((state) => ({
      ...state,
      tags: [parentTag, childTag, mixedParentTag, otherChildTag],
    }));

    expect(useTagStore.getState().updateTag("tag-b", { id: "crafting:renamed_child" })).toBe(true);

    const tags = useTagStore.getState().tags;
    expect(tags[1]?.id).toBe("crafting:renamed_child");
    expect(tags[0]?.values).toEqual([{ type: "custom_tag", uid: "tag-b" }]);
    expect(tags[2]?.values).toEqual(mixedParentTag.values);
    // only the renamed tag's ref changes what it resolves to
    expect(generateTag(tags[2]!, ctx(tags)).values).toEqual([
      "minecraft:dirt",
      "#crafting:renamed_child",
      "#crafting:other_child",
    ]);
  });

  it("throws when creating a duplicate tag id", () => {
    useTagStore.setState((state) => ({
      ...state,
      tags: [createTag("tag-a", "crafting:duplicate")],
    }));

    expect(() =>
      useTagStore.getState().createTag({
        id: "crafting:duplicate",
        values: [],
      }),
    ).toThrow(getDuplicateTagIdErrorMessage("crafting:duplicate"));
    expect(useTagStore.getState().tags).toEqual([createTag("tag-a", "crafting:duplicate")]);
  });

  it("returns true when creating a tag succeeds", () => {
    expect(
      useTagStore.getState().createTag({
        id: "crafting:new_tag",
        values: [createItemValue("minecraft:stone")],
      }),
    ).toBe(true);
  });

  it("throws when renaming a tag to another existing id", () => {
    useTagStore.setState((state) => ({
      ...state,
      tags: [createTag("tag-a", "crafting:first"), createTag("tag-b", "crafting:second")],
    }));

    expect(() => useTagStore.getState().updateTag("tag-b", { id: "crafting:first" })).toThrow(
      getDuplicateTagIdErrorMessage("crafting:first"),
    );
    expect(useTagStore.getState().tags).toEqual([
      createTag("tag-a", "crafting:first"),
      createTag("tag-b", "crafting:second"),
    ]);
  });

  it("allows updating a tag to its current id", () => {
    useTagStore.setState((state) => ({
      ...state,
      tags: [createTag("tag-a", "crafting:same")],
    }));

    expect(
      useTagStore.getState().updateTag("tag-a", {
        id: "crafting:same",
      }),
    ).toBe(false);
    expect(useTagStore.getState().tags).toEqual([createTag("tag-a", "crafting:same")]);
  });

  it("returns whether tag values changed", () => {
    useTagStore.setState((state) => ({
      ...state,
      tags: [createTag("tag-a", "crafting:tag")],
    }));

    const value = createItemValue("minecraft:stone");

    expect(useTagStore.getState().addValueToTag("tag-a", value)).toBe(true);
    expect(useTagStore.getState().addValueToTag("tag-a", value)).toBe(false);
    expect(useTagStore.getState().removeValueFromTagByIndex("tag-a", 0)).toBe(true);
    expect(useTagStore.getState().removeValueFromTagByIndex("tag-a", 0)).toBe(false);
  });

  it("accepts an item and a tag that share a raw id", () => {
    useTagStore.setState((state) => ({
      ...state,
      tags: [createTag("tag-a", "crafting:tag")],
    }));

    // "minecraft:stone" and "#minecraft:stone" are different entries in a tag file
    expect(useTagStore.getState().addValueToTag("tag-a", createItemValue("minecraft:stone"))).toBe(
      true,
    );
    expect(useTagStore.getState().addValueToTag("tag-a", createTagValue("minecraft:stone"))).toBe(
      true,
    );
    expect(useTagStore.getState().tags[0]?.values).toEqual([
      createItemValue("minecraft:stone"),
      createTagValue("minecraft:stone"),
    ]);
  });

  it("strips a data value on write, so stored values match what export emits", () => {
    useTagStore.setState((state) => ({
      ...state,
      tags: [createTag("tag-a", "crafting:tag")],
    }));

    expect(
      useTagStore.getState().addValueToTag("tag-a", {
        type: "item",
        id: { namespace: "mymod", id: "gem", data: 1 },
      }),
    ).toBe(true);
    expect(itemValueId(useTagStore.getState().tags[0]?.values[0])).toEqual({
      namespace: "mymod",
      id: "gem",
    });

    // the data-free form is now a duplicate of it
    expect(useTagStore.getState().addValueToTag("tag-a", createItemValue("mymod:gem"))).toBe(false);
  });

  it("strips data values passed through createTag", () => {
    useTagStore.getState().createTag({
      id: "crafting:gems",
      values: [{ type: "item", id: { namespace: "mymod", id: "gem", data: 3 } }],
    });

    expect(itemValueId(useTagStore.getState().tags[0]?.values[0])).toEqual({
      namespace: "mymod",
      id: "gem",
    });
  });

  it("resolves a uid ref to the child's new id without touching the parent's values", () => {
    const childTag = createTag("tag-b", "crafting:child", [createItemValue("minecraft:diamond")]);
    const parentTag = createTag("tag-a", "crafting:parent", [{ type: "custom_tag", uid: "tag-b" }]);

    useTagStore.setState((state) => ({ ...state, tags: [parentTag, childTag] }));

    const valuesBefore = useTagStore.getState().tags[0]?.values;
    expect(useTagStore.getState().updateTag("tag-b", { id: "crafting:renamed" })).toBe(true);

    const tags = useTagStore.getState().tags;
    // the whole point of the refactor: the reference is unchanged, yet resolves to the new id
    expect(tags[0]?.values).toEqual(valuesBefore);
    expect(resolveTagValues(tags[0]?.values ?? [], ctx(tags))).toEqual(["minecraft:diamond"]);
    expect(generateTag(tags[0]!, ctx(tags)).values).toEqual(["#crafting:renamed"]);
  });

  it("stores a custom item as a uid ref that follows its rename", () => {
    const customItem: CustomItem = {
      type: "custom_item",
      uid: "ci-1",
      id: { namespace: "mymod", id: "ruby" },
      displayName: "Ruby",
      texture: "ruby.png",
      _version: MinecraftVersion.V121,
    };

    useTagStore.setState((state) => ({ ...state, tags: [createTag("tag-a", "crafting:gems")] }));
    expect(useTagStore.getState().addValueToTag("tag-a", toTagValue(customItem))).toBe(true);

    const stored = useTagStore.getState().tags[0]!;
    expect(stored.values).toEqual([{ type: "custom_item", uid: "ci-1" }]);

    const withRefs = (item: CustomItem): TagContext => ({
      ...ctx([stored]),
      customItemsByUid: { "ci-1": item },
    });

    expect(generateTag(stored, withRefs(customItem)).values).toEqual(["mymod:ruby"]);
    // renaming the item changes the export with no stored value being rewritten
    const renamed = { ...customItem, id: { namespace: "mymod", id: "red_gem" } };
    expect(generateTag(stored, withRefs(renamed)).values).toEqual(["mymod:red_gem"]);
    expect(useTagStore.getState().tags[0]?.values).toEqual([{ type: "custom_item", uid: "ci-1" }]);
  });

  it("keeps nested tag resolution working after renaming a referenced child tag", () => {
    const grandchildTag = createTag("tag-c", "crafting:grandchild", [
      createItemValue("minecraft:diamond"),
    ]);
    const childTag = createTag("tag-b", "crafting:child", [{ type: "custom_tag", uid: "tag-c" }]);
    const parentTag = createTag("tag-a", "crafting:parent", [{ type: "custom_tag", uid: "tag-b" }]);

    useTagStore.setState((state) => ({
      ...state,
      tags: [parentTag, childTag, grandchildTag],
    }));

    expect(useTagStore.getState().updateTag("tag-c", { id: "crafting:renamed_grandchild" })).toBe(
      true,
    );

    const tags = useTagStore.getState().tags;
    expect(tags[1]?.values[0]).toEqual({ type: "custom_tag", uid: "tag-c" });
    expect(resolveTagValues(tags[0]?.values ?? [], ctx(tags))).toEqual(["minecraft:diamond"]);
  });

  // every other write path normalizes; this one spreads the caller's identifier, so it must too
  it("strips a data value when materializing a ref", () => {
    useTagStore.setState((state) => ({
      ...state,
      tags: [createTag("tag-1", "crafting:gems", [{ type: "custom_item", uid: "ci-1" }])],
    }));

    useTagStore
      .getState()
      .materializeCustomRefs("custom_item", "ci-1", { namespace: "mymod", id: "ruby", data: 3 });

    expect(useTagStore.getState().tags[0]?.values).toEqual([
      { type: "item", id: { namespace: "mymod", id: "ruby" } },
    ]);
  });
});
