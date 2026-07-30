import { describe, expect, it } from "vitest";

import { CustomItem, Item, TagItem } from "@/data/models/types";
import { MinecraftVersion } from "@/data/types";

import { buildTagValueOptions } from "./use-filtered-value-options";

const item: Item = {
  type: "default_item",
  id: { namespace: "minecraft", id: "stone" },
  displayName: "Stone",
  texture: "stone.png",
  _version: MinecraftVersion.V121,
};

const customItem: CustomItem = {
  type: "custom_item",
  uid: "custom-item-1",
  id: { namespace: "mymod", id: "ruby" },
  displayName: "Ruby",
  texture: "ruby.png",
  _version: MinecraftVersion.V121,
};

const vanillaTagItem: TagItem = {
  type: "tag_item",
  id: { namespace: "minecraft", id: "logs" },
  displayName: "#minecraft:logs",
  texture: "oak_log.png",
  _version: MinecraftVersion.V121,
  tagSource: "vanilla",
  values: ["minecraft:oak_log"],
};

const customTagItem: TagItem = {
  ...vanillaTagItem,
  id: { namespace: "crafting", id: "gems" },
  displayName: "#crafting:gems",
  tagSource: "custom",
  uid: "tag-1",
  values: ["mymod:ruby"],
};

describe("buildTagValueOptions", () => {
  it("offers custom items, and puts them ahead of the vanilla catalogue", () => {
    const options = buildTagValueOptions({
      customItems: [customItem],
      items: [item],
      vanillaTagItems: [],
      customTagItems: [],
    });

    expect(options).toEqual([
      { kind: "item", item: customItem },
      { kind: "item", item },
    ]);
  });

  it("keeps vanilla and custom tag options with their raw ids", () => {
    const options = buildTagValueOptions({
      customItems: [],
      items: [],
      vanillaTagItems: [vanillaTagItem],
      customTagItems: [customTagItem],
    });

    expect(options).toEqual([
      { kind: "tag", tagItem: vanillaTagItem, rawId: "minecraft:logs" },
      { kind: "tag", tagItem: customTagItem, rawId: "crafting:gems" },
    ]);
  });

  it("returns nothing when every source is empty", () => {
    expect(
      buildTagValueOptions({
        customItems: [],
        items: [],
        vanillaTagItems: [],
        customTagItems: [],
      }),
    ).toEqual([]);
  });
});
