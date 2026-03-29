import { useMemo } from "react";

import { RecipeSlot } from "@/data/types";
import { useItemSelection } from "@/hooks/use-item-selection";
import { usePreviewSlotSelectionHandler } from "@/hooks/use-preview-slot-selection-handler";
import { useResolvedSlotItem } from "@/hooks/use-resolved-tag-item";
import { isItemDraggableData, ItemPreviewDropTargetData } from "@/lib/dnd";
import { canRecipeSlotAcceptIngredient } from "@/lib/recipe-slots";
import { cn } from "@/lib/utils";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipeSlot } from "@/stores/recipe/selectors";

import { SlotProps } from "../slot/slot";
import { SlotDropTarget } from "../slot/slot-drop-target";
import { Item } from "./item";

type ItemPreviewDropTargetProps = {
  slot: RecipeSlot;
} & SlotProps;

export const ItemPreviewDropTarget = ({ slot, ...props }: ItemPreviewDropTargetProps) => {
  const rawSlotValue = useRecipeStore(selectCurrentRecipeSlot(slot));
  const slotValue = useResolvedSlotItem(rawSlotValue);

  const selection = useItemSelection();
  const isSlotSelected = selection?.type === "preview" && selection.slot === slot;
  const isDisabledForSelection =
    selection !== undefined && !canRecipeSlotAcceptIngredient(slot, selection.item);

  const dropTargetData = useMemo(
    (): ItemPreviewDropTargetData => ({ type: "preview", slot }),
    [slot],
  );

  const handleClick = usePreviewSlotSelectionHandler(slot, rawSlotValue);

  return (
    <SlotDropTarget<ItemPreviewDropTargetData>
      data={dropTargetData}
      {...props}
      disabled={isDisabledForSelection || props.disabled}
      className={cn(isSlotSelected && "ring-primary z-10 rounded ring-2", props.className)}
      canDrop={({ source }) => {
        if (isItemDraggableData(source.data)) {
          return canRecipeSlotAcceptIngredient(slot, source.data.item);
        }

        return false;
      }}
      onClick={(event) => {
        props.onClick?.(event);
        handleClick(event);
      }}
    >
      {slotValue && <Item item={slotValue} container="preview" />}
    </SlotDropTarget>
  );
};
