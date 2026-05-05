import { cn } from "@/lib/utils";
import { RecipeSlot } from "@/recipes/slots";

import { LARGE_SLOT_SIZE, SLOT_SIZE, SlotProps } from "../slot/slot";
import { EditableItemCount } from "./editable-item-count";
import { ItemPreviewDropTarget } from "./item-preview-drop-target";

type ItemPreviewResultSlotProps = {
  slot: RecipeSlot;
  compact?: boolean;
} & Omit<SlotProps, "children" | "width" | "height">;

export const ItemPreviewResultSlot = ({
  slot,
  compact,
  className,
  style,
  ...props
}: ItemPreviewResultSlotProps) => {
  const size = compact === false ? LARGE_SLOT_SIZE : SLOT_SIZE;

  return (
    <div
      {...props}
      className={cn("relative", className)}
      style={{
        width: size,
        height: size,
        ...style,
      }}
    >
      <ItemPreviewDropTarget slot={slot} width={size} height={size} />
      <EditableItemCount slot={slot} compact={compact !== false} />
    </div>
  );
};
