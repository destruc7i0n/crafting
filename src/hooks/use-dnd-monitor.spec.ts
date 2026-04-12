import { describe, expect, it, vi } from "vitest";

import { MinecraftVersion } from "@/data/types";
import { RecipeSlot } from "@/recipes/slots";

import { applyRecipeDragDrop } from "./use-dnd-monitor";

type SetRecipeSlot = Parameters<typeof applyRecipeDragDrop>[0]["setRecipeSlot"];
type SetRecipeSlotFromIngredient = Parameters<
  typeof applyRecipeDragDrop
>[0]["setRecipeSlotFromIngredient"];

const makePaletteItem = () => ({
  type: "palette-item" as const,
  item: {
    type: "default_item" as const,
    id: { namespace: "minecraft", id: "stone" },
    displayName: "stone",
    texture: "stone.png",
    _version: MinecraftVersion.V121,
  },
});

const makeRecipeSlotItem = (slot: RecipeSlot = "crafting.1") => ({
  type: "recipe-slot" as const,
  slot,
  value: {
    kind: "item" as const,
    id: { namespace: "minecraft", id: "stone" },
  },
});

describe("applyRecipeDragDrop", () => {
  it("removes a dragged recipe-slot item when dropped outside all slots", () => {
    const setRecipeSlot = vi.fn<SetRecipeSlot>();
    const setRecipeSlotFromIngredient = vi.fn<SetRecipeSlotFromIngredient>();

    applyRecipeDragDrop({
      sourceData: makeRecipeSlotItem(),
      sourceSlot: "crafting.1",
      destinationData: undefined,
      setRecipeSlot,
      setRecipeSlotFromIngredient,
    });

    expect(setRecipeSlot).toHaveBeenCalledWith("crafting.1", undefined);
    expect(setRecipeSlotFromIngredient).not.toHaveBeenCalled();
  });

  it("moves a dragged recipe-slot item to a valid empty slot", () => {
    const setRecipeSlot = vi.fn<SetRecipeSlot>();
    const setRecipeSlotFromIngredient = vi.fn<SetRecipeSlotFromIngredient>();

    applyRecipeDragDrop({
      sourceData: makeRecipeSlotItem(),
      sourceSlot: "crafting.1",
      destinationData: { type: "recipe-slot-target", slot: "crafting.2" },
      setRecipeSlot,
      setRecipeSlotFromIngredient,
    });

    expect(setRecipeSlot).toHaveBeenNthCalledWith(1, "crafting.2", {
      kind: "item",
      id: { namespace: "minecraft", id: "stone" },
    });
    expect(setRecipeSlot).toHaveBeenNthCalledWith(2, "crafting.1", undefined);
  });

  it("treats same-slot drops as a no-op", () => {
    const setRecipeSlot = vi.fn<SetRecipeSlot>();
    const setRecipeSlotFromIngredient = vi.fn<SetRecipeSlotFromIngredient>();

    applyRecipeDragDrop({
      sourceData: makeRecipeSlotItem("crafting.1"),
      sourceSlot: "crafting.1",
      destinationData: { type: "recipe-slot-target", slot: "crafting.1" },
      setRecipeSlot,
      setRecipeSlotFromIngredient,
    });

    expect(setRecipeSlot).not.toHaveBeenCalled();
    expect(setRecipeSlotFromIngredient).not.toHaveBeenCalled();
  });

  it("places palette items only on valid recipe slots", () => {
    const setRecipeSlot = vi.fn<SetRecipeSlot>();
    const setRecipeSlotFromIngredient = vi.fn<SetRecipeSlotFromIngredient>();

    applyRecipeDragDrop({
      sourceData: makePaletteItem(),
      destinationData: { type: "recipe-slot-target", slot: "crafting.result" },
      setRecipeSlot,
      setRecipeSlotFromIngredient,
    });

    expect(setRecipeSlotFromIngredient).toHaveBeenCalledWith("crafting.result", {
      type: "default_item",
      id: { namespace: "minecraft", id: "stone" },
      displayName: "stone",
      texture: "stone.png",
      _version: MinecraftVersion.V121,
    });
    expect(setRecipeSlot).not.toHaveBeenCalled();
  });
});
