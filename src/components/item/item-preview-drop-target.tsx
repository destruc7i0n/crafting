import { useMemo } from "react";

import { RecipeSlot } from "@/data/types";
import { usePreviewSlotSelectionHandler } from "@/hooks/use-preview-slot-selection-handler";
import { useResolvedSlotItem } from "@/hooks/use-resolved-tag-item";
import { isItemDraggableData, ItemPreviewDropTargetData } from "@/lib/dnd";
import { canRecipeSlotAcceptIngredient } from "@/lib/recipe-slots";
import { cn } from "@/lib/utils";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipeSlot } from "@/stores/recipe/selectors";
import { useUIStore } from "@/stores/ui";

import { SlotProps } from "../slot/slot";
import { SlotDropTarget } from "../slot/slot-drop-target";
import { Item } from "./item";

type ItemPreviewDropTargetProps = {
  slot: RecipeSlot;
} & SlotProps;

export const ItemPreviewDropTarget = ({ slot, ...props }: ItemPreviewDropTargetProps) => {
  const rawSlotValue = useRecipeStore(selectCurrentRecipeSlot(slot));
  const slotValue = useResolvedSlotItem(rawSlotValue);

  const isSlotSelected = useUIStore((state) => state.selectedPreview?.slot === slot);
  const isPendingReplace = useUIStore(
    (state) =>
      state.selectedIngredient?.replaceTarget === slot ||
      state.selectedPreview?.replaceTarget === slot,
  );

  const dropTargetData = useMemo(
    (): ItemPreviewDropTargetData => ({ type: "preview", slot }),
    [slot],
  );

  const handleClick = usePreviewSlotSelectionHandler(slot, rawSlotValue);

  return (
    <SlotDropTarget<ItemPreviewDropTargetData>
      data={dropTargetData}
      {...props}
      className={cn(
        isSlotSelected && "ring-primary z-10 rounded ring-2",
        isPendingReplace && "z-10 rounded ring-2 ring-amber-400",
        props.className,
      )}
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
