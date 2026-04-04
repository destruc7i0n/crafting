import { describe, expect, it } from "vitest";

import { isItemDraggableData, isRecipeSlotDropTargetData } from "./dnd";

describe("dnd data guards", () => {
  it("recognizes item draggable data", () => {
    expect(
      isItemDraggableData({
        type: "palette-item",
        item: {
          type: "default_item",
          id: { raw: "minecraft:stone", id: "stone", namespace: "minecraft" },
          displayName: "stone",
          texture: "",
          _version: "1.21",
        },
      }),
    ).toBe(true);
  });

  it("rejects malformed draggable data", () => {
    expect(isItemDraggableData({ type: "item", container: "sidebar" })).toBe(false);
    expect(isItemDraggableData({ type: "preview", slot: "crafting.1" })).toBe(false);
    expect(isItemDraggableData(null)).toBe(false);
  });

  it("recognizes recipe slot drop target data", () => {
    expect(isRecipeSlotDropTargetData({ type: "recipe-slot-target", slot: "crafting.1" })).toBe(
      true,
    );
  });

  it("rejects unrelated drop target data", () => {
    expect(isRecipeSlotDropTargetData({ type: "recipe-slot-target" })).toBe(false);
    expect(isRecipeSlotDropTargetData({ type: "unknown" })).toBe(false);
  });
});
