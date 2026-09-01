import { beforeEach, describe, expect, it } from "vitest";

import { CustomItem, Tag } from "@/data/models/types";
import { MinecraftVersion } from "@/data/types";
import { useCustomItemStore } from "@/stores/custom-item";
import { VersionResourceData, useResourcesStore } from "@/stores/resources";
import { useSettingsStore } from "@/stores/settings";
import { useTagStore } from "@/stores/tag";

import { createSlotContext, getSlotContext } from "./slot-context";

const customItem: CustomItem = {
  type: "custom_item",
  uid: "custom-1",
  id: { namespace: "crafting", id: "custom_item" },
  displayName: "Custom Item",
  texture: "",
  _version: MinecraftVersion.V121,
};

const tag: Tag = {
  uid: "tag-1",
  id: "crafting:tag",
  values: [],
};

const resources: VersionResourceData = {
  items: [],
  itemsById: {},
  vanillaTags: { "minecraft:planks": ["minecraft:oak_planks"] },
};

describe("createSlotContext", () => {
  it("indexes custom items and tags by uid and exposes vanilla tags", () => {
    const context = createSlotContext({
      version: MinecraftVersion.V121,
      resources,
      customItems: [customItem],
      tags: [tag],
    });

    expect(context.version).toBe(MinecraftVersion.V121);
    expect(context.resources).toBe(resources);
    expect(context.customItemsByUid).toEqual({ "custom-1": customItem });
    expect(context.tagsByUid).toEqual({ "tag-1": tag });
    expect(context.allTags).toEqual([tag]);
    expect(context.vanillaTags).toEqual(resources.vanillaTags);
  });

  it("falls back to empty vanilla tags when resources are not loaded", () => {
    const context = createSlotContext({
      version: MinecraftVersion.V121,
      resources: undefined,
      customItems: [],
      tags: [],
    });

    expect(context.resources).toBeUndefined();
    expect(context.vanillaTags).toEqual({});
    expect(context.customItemsByUid).toEqual({});
    expect(context.tagsByUid).toEqual({});
  });
});

describe("getSlotContext", () => {
  beforeEach(() => {
    useSettingsStore.setState({ minecraftVersion: MinecraftVersion.V120 });
    useResourcesStore.setState({ [MinecraftVersion.V120]: undefined });
    useCustomItemStore.setState((state) => ({ ...state, customItems: [customItem] }));
    useTagStore.setState((state) => ({ ...state, tags: [tag] }));
  });

  it("reads the current version, custom items and tags from the stores", () => {
    const context = getSlotContext();

    expect(context.version).toBe(MinecraftVersion.V120);
    expect(context.resources).toBeUndefined();
    expect(context.vanillaTags).toEqual({});
    expect(context.customItemsByUid).toEqual({ "custom-1": customItem });
    expect(context.tagsByUid).toEqual({ "tag-1": tag });
    expect(context.allTags).toEqual([tag]);
  });

  it("uses the resources loaded for the current version", () => {
    useResourcesStore.getState().setResourceData(MinecraftVersion.V120, resources);

    const context = getSlotContext();

    expect(context.resources).toBe(resources);
    expect(context.vanillaTags).toEqual(resources.vanillaTags);
  });
});
