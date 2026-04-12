import { IngredientItem } from "@/data/models/types";
import { RecipeSlot } from "@/recipes/slots";
import { RecipeSlotValue } from "@/stores/recipe/types";

export type RecipeSlotDropTargetData = {
  type: "recipe-slot-target";
  slot: RecipeSlot;
};

export type PaletteItemDraggableData = {
  type: "palette-item";
  item: IngredientItem;
};

export type RecipeSlotDraggableData = {
  type: "recipe-slot";
  slot: RecipeSlot;
  value: RecipeSlotValue;
};

export type ItemDraggableData = PaletteItemDraggableData | RecipeSlotDraggableData;

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

export const isRecipeSlotDropTargetData = (value: unknown): value is RecipeSlotDropTargetData => {
  return isRecord(value) && value.type === "recipe-slot-target" && typeof value.slot === "string";
};

export const isItemDraggableData = (value: unknown): value is ItemDraggableData => {
  if (!isRecord(value)) {
    return false;
  }

  if (value.type === "palette-item") {
    return "item" in value;
  }

  return value.type === "recipe-slot" && typeof value.slot === "string" && "value" in value;
};
