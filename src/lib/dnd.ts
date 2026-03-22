import { IngredientItem } from "@/data/models/types";
import { RecipeSlot } from "@/data/types";

export type ItemPreviewDropTargetData = {
  type: "preview";
  slot: RecipeSlot;
};

export type DropTargetData = ItemPreviewDropTargetData;

export type ItemDraggableContainer = "preview" | "ingredients";

export type ItemDraggableData = {
  type: "item";
  item: IngredientItem;
  container: ItemDraggableContainer;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

export const isItemPreviewDropTargetData = (value: unknown): value is ItemPreviewDropTargetData => {
  return isRecord(value) && value.type === "preview" && typeof value.slot === "string";
};

export const isDropTargetData = (value: unknown): value is DropTargetData => {
  return isItemPreviewDropTargetData(value);
};

export const isItemDraggableData = (value: unknown): value is ItemDraggableData => {
  return (
    isRecord(value) &&
    value.type === "item" &&
    "item" in value &&
    (value.container === "preview" || value.container === "ingredients")
  );
};
