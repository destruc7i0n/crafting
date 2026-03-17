import { cloneItem } from "@/data/models/item/utilities";
import { RecipeSlot } from "@/data/types";
import { useIsTouchDevice } from "@/hooks/use-is-touch-device";
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
  const isTouchDevice = useIsTouchDevice();
  const rawSlotValue = useRecipeStore(selectCurrentRecipeSlot(slot));
  const slotValue = useResolvedSlotItem(rawSlotValue);
  const setRecipeSlot = useRecipeStore((state) => state.setRecipeSlot);

  const isSlotSelected = useUIStore(
    (state) => state.selectedItem?.source === "preview" && state.selectedItem.slot === slot,
  );

  return (
    <SlotDropTarget<ItemPreviewDropTargetData>
      data={{ type: "preview", slot }}
      {...props}
      className={cn(isSlotSelected && "ring-primary z-10 rounded ring-2", props.className)}
      canDrop={({ source }) => {
        if (isItemDraggableData(source.data)) {
          return canRecipeSlotAcceptIngredient(slot, source.data.item);
        }

        return false;
      }}
      onClick={(event) => {
        props.onClick?.(event);

        if (!isTouchDevice) {
          return;
        }

        const { selectedItem, setSelectedItem } = useUIStore.getState();

        if (selectedItem?.source === "preview" && selectedItem.slot === slot) {
          // tap same selected slot -> deselect
          setSelectedItem(undefined);
          return;
        }

        if (selectedItem?.source === "ingredients") {
          // ingredient selected -> place it
          if (!canRecipeSlotAcceptIngredient(slot, selectedItem.item)) return;
          setRecipeSlot(slot, cloneItem(selectedItem.item));
          setSelectedItem(undefined);
          return;
        }

        if (selectedItem?.source === "preview") {
          // different preview slot selected -> move
          setRecipeSlot(slot, cloneItem(selectedItem.item));
          setRecipeSlot(selectedItem.slot, undefined);
          setSelectedItem(undefined);
          return;
        }

        // nothing selected
        if (rawSlotValue) {
          // tap occupied slot -> select it
          setSelectedItem({ source: "preview", item: rawSlotValue, slot });
        }
      }}
    >
      {slotValue && <Item item={slotValue} container="preview" />}
    </SlotDropTarget>
  );
};
