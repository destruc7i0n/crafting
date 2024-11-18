import { RecipeSlot } from "@/data/types";
import { ItemPreviewDropTargetData } from "@/lib/dnd";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipeSlot } from "@/stores/recipe/selectors";

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
  const slotValue = useRecipeStore(selectCurrentRecipeSlot(slot));

  return (
    <SlotDropTarget<ItemPreviewDropTargetData>
      data={{ type: "preview", slot }}
      {...props}
    >
      {slotValue && (
        <Item item={slotValue} container="preview" showCount={showCount} />
      )}
    </SlotDropTarget>
  );
};
