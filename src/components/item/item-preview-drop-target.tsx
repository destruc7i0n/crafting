import { cloneItem } from "@/data/models/item/utilities";
import { RecipeSlot } from "@/data/types";
import { useIsTouchDevice } from "@/hooks/use-is-touch-device";
import { ItemPreviewDropTargetData } from "@/lib/dnd";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipeSlot } from "@/stores/recipe/selectors";
import { useUIStore } from "@/stores/ui";

import { Item } from "./item";
import { SlotProps } from "../slot/slot";
import { SlotDropTarget } from "../slot/slot-drop-target";

type ItemPreviewDropTargetProps = {
  slot: RecipeSlot;
  showCount?: boolean;
} & SlotProps;

export const ItemPreviewDropTarget = ({
  slot,
  showCount = false,
  ...props
}: ItemPreviewDropTargetProps) => {
  const isTouchDevice = useIsTouchDevice();
  const slotValue = useRecipeStore(selectCurrentRecipeSlot(slot));
  const setRecipeSlot = useRecipeStore((state) => state.setRecipeSlot);
  const selectedIngredient = useUIStore((state) => state.selectedIngredient);
  const setSelectedIngredient = useUIStore((state) => state.setSelectedIngredient);

  return (
    <SlotDropTarget<ItemPreviewDropTargetData>
      data={{ type: "preview", slot }}
      {...props}
      onClick={(event) => {
        props.onClick?.(event);

        if (!isTouchDevice) {
          return;
        }

        if (selectedIngredient) {
          setRecipeSlot(slot, cloneItem(selectedIngredient));
          setSelectedIngredient(undefined);
        } else if (slotValue) {
          setRecipeSlot(slot, undefined);
        }
      }}
    >
      {slotValue && <Item item={slotValue} container="preview" showCount={showCount} />}
    </SlotDropTarget>
  );
};
