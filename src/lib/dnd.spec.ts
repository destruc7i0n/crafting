import { describe, expect, it } from "vitest";

import {
  isDropTargetData,
  isItemDraggableData,
  isItemPreviewDropTargetData,
  isTagDropTargetData,
} from "./dnd";

describe("dnd data guards", () => {
  it("recognizes item draggable data", () => {
    expect(
      isItemDraggableData({
        type: "item",
        item: {
          type: "default_item",
          id: { raw: "minecraft:stone", id: "stone", namespace: "minecraft" },
          displayName: "stone",
          texture: "",
          _version: "1.21",
        },
        container: "ingredients",
      }),
    ).toBe(true);
  });

  it("rejects malformed draggable data", () => {
    expect(isItemDraggableData({ type: "item", container: "sidebar" })).toBe(false);
    expect(isItemDraggableData({ type: "preview", slot: "crafting.1" })).toBe(false);
    expect(isItemDraggableData(null)).toBe(false);
  });

  it("recognizes preview drop target data", () => {
    expect(isItemPreviewDropTargetData({ type: "preview", slot: "crafting.1" })).toBe(true);
    expect(isDropTargetData({ type: "preview", slot: "crafting.1" })).toBe(true);
  });

  it("recognizes tag creation drop target data", () => {
    expect(isTagDropTargetData({ type: "tag-creation" })).toBe(true);
    expect(isDropTargetData({ type: "tag-creation" })).toBe(true);
  });

  it("rejects unrelated drop target data", () => {
    expect(isItemPreviewDropTargetData({ type: "preview" })).toBe(false);
    expect(isTagDropTargetData({ type: "preview", slot: "crafting.1" })).toBe(false);
    expect(isDropTargetData({ type: "unknown" })).toBe(false);
  });
});
