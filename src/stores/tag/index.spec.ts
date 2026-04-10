import { beforeEach, describe, expect, it } from "vitest";

import { parseStringToMinecraftIdentifier } from "@/data/models/identifier/utilities";
import { Tag, TagValue } from "@/data/models/types";
import { resolveTagValues } from "@/lib/tags";

import { useTagStore } from "./index";

const createItemValue = (id: string): TagValue => ({
  type: "item",
  id: parseStringToMinecraftIdentifier(id),
});

const createTagValue = (id: string): TagValue => ({
  type: "tag",
  id: parseStringToMinecraftIdentifier(id),
});

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
  });

  it("rewrites only matching parent tag references when a child tag is renamed", () => {
    const parentTag = createTag("tag-a", "crafting:parent", [createTagValue("crafting:child")]);
    const childTag = createTag("tag-b", "crafting:child", [createItemValue("minecraft:stone")]);
    const mixedParentTag = createTag("tag-c", "crafting:mixed_parent", [
      createItemValue("minecraft:dirt"),
      createTagValue("crafting:child"),
      createTagValue("crafting:other_child"),
    ]);
    const otherChildTag = createTag("tag-d", "crafting:other_child");

    useTagStore.setState((state) => ({
      ...state,
      tags: [parentTag, childTag, mixedParentTag, otherChildTag],
    }));

    useTagStore.getState().updateTag("tag-b", { id: "crafting:renamed_child" });

    const tags = useTagStore.getState().tags;
    expect(tags[1]?.id).toBe("crafting:renamed_child");
    expect(tags[0]?.values[0]).toEqual(createTagValue("crafting:renamed_child"));
    expect(tags[2]?.values).toEqual([
      createItemValue("minecraft:dirt"),
      createTagValue("crafting:renamed_child"),
      createTagValue("crafting:other_child"),
    ]);
  });

  it("keeps nested tag resolution working after renaming a referenced child tag", () => {
    const grandchildTag = createTag("tag-c", "crafting:grandchild", [
      createItemValue("minecraft:diamond"),
    ]);
    const childTag = createTag("tag-b", "crafting:child", [createTagValue("crafting:grandchild")]);
    const parentTag = createTag("tag-a", "crafting:parent", [createTagValue("crafting:child")]);

    useTagStore.setState((state) => ({
      ...state,
      tags: [parentTag, childTag, grandchildTag],
    }));

    useTagStore.getState().updateTag("tag-c", { id: "crafting:renamed_grandchild" });

    const tags = useTagStore.getState().tags;
    expect(tags[1]?.values[0]).toEqual(createTagValue("crafting:renamed_grandchild"));
    expect(resolveTagValues(tags[0]?.values ?? [], tags, {})).toEqual(["minecraft:diamond"]);
  });
});
