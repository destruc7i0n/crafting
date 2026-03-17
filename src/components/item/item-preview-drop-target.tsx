import { cloneItem } from "@/data/models/item/utilities";
import { RecipeSlot } from "@/data/types";
import { useIsTouchDevice } from "@/hooks/use-is-touch-device";
import { useResolvedSlotItem } from "@/hooks/use-resolved-tag-item";
import { isItemDraggableData, ItemPreviewDropTargetData } from "@/lib/dnd";
import { canRecipeSlotAcceptIngredient } from "@/lib/recipe-slots";
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

  return (
    <SlotDropTarget<ItemPreviewDropTargetData>
      data={{ type: "preview", slot }}
      {...props}
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

        const selectedIngredient = useUIStore.getState().selectedIngredient;
        if (selectedIngredient) {
          if (!canRecipeSlotAcceptIngredient(slot, selectedIngredient)) {
            return;
          }

          setRecipeSlot(slot, cloneItem(selectedIngredient));
          useUIStore.getState().setSelectedIngredient(undefined);
        } else if (slotValue) {
          setRecipeSlot(slot, undefined);
        }
      }}
    >
      {slotValue && <Item item={slotValue} container="preview" />}
    </SlotDropTarget>
  );
};
