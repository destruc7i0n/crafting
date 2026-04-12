import { useMemo } from "react";

import { useItemSelection } from "@/hooks/use-item-selection";
import { useRecipeSlotSelectionHandler } from "@/hooks/use-recipe-slot-selection-handler";
import { isItemDraggableData, RecipeSlotDropTargetData } from "@/lib/dnd";
import { cn } from "@/lib/utils";
import { RecipeSlot } from "@/recipes/slots";
import {
  canRecipeSlotAcceptIngredientItem,
  canRecipeSlotAcceptSlotValue,
} from "@/recipes/slots/utils";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipeSlot } from "@/stores/recipe/selectors";

import { SlotProps } from "../slot/slot";
import { SlotDropTarget } from "../slot/slot-drop-target";
import { RecipeSlotItem } from "./recipe-slot-item";

type ItemPreviewDropTargetProps = {
  slot: RecipeSlot;
} & SlotProps;

export const ItemPreviewDropTarget = ({ slot, ...props }: ItemPreviewDropTargetProps) => {
  const slotValue = useRecipeStore(selectCurrentRecipeSlot(slot));

  const selection = useItemSelection();
  const isSlotSelected = selection?.type === "slot" && selection.slot === slot;
  const isDisabledForSelection =
    selection !== undefined &&
    !(selection.type === "ingredient"
      ? canRecipeSlotAcceptIngredientItem(slot, selection.item)
      : canRecipeSlotAcceptSlotValue(slot, selection.value));

  const dropTargetData = useMemo(
    (): RecipeSlotDropTargetData => ({ type: "recipe-slot-target", slot }),
    [slot],
  );

  const handleClick = useRecipeSlotSelectionHandler(slot, slotValue);

  return (
    <SlotDropTarget<RecipeSlotDropTargetData>
      data={dropTargetData}
      {...props}
      disabled={isDisabledForSelection || props.disabled}
      className={cn(isSlotSelected && "ring-primary z-10 rounded ring-2", props.className)}
      canDrop={({ source }) => {
        if (isItemDraggableData(source.data)) {
          return source.data.type === "palette-item"
            ? canRecipeSlotAcceptIngredientItem(slot, source.data.item)
            : canRecipeSlotAcceptSlotValue(slot, source.data.value);
        }

        return false;
      }}
      onClick={(event) => {
        props.onClick?.(event);
        handleClick(event);
      }}
    >
      {slotValue && <RecipeSlotItem slot={slot} value={slotValue} />}
    </SlotDropTarget>
  );
};
