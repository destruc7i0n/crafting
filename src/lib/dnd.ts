import { Item } from "@/data/models/types";
import { RecipeSlot } from "@/data/types";

export type TagDropTargetData = {
  type: "tag-creation";
};

export type ItemPreviewDropTargetData = {
  type: "preview";
  slot: RecipeSlot;
};

export type DropTargetData = TagDropTargetData | ItemPreviewDropTargetData;

export type ItemDraggableContainer = "preview" | "ingredients";

export type ItemDraggableData = {
  type: "item";
  item: Item;
  container: ItemDraggableContainer;
};
