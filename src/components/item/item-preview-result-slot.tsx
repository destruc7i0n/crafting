import { cn } from "@/lib/utils";
import { RecipeSlot } from "@/recipes/slots";

import { SlotProps } from "../slot/slot";
import { EditableItemCount } from "./editable-item-count";
import { ItemPreviewDropTarget } from "./item-preview-drop-target";

type ItemPreviewResultSlotProps = {
  slot: RecipeSlot;
} & Omit<SlotProps, "children">;

export const ItemPreviewResultSlot = ({
  slot,
  width = 36,
  height = 36,
  className,
  style,
  ...props
}: ItemPreviewResultSlotProps) => {
  const compactCount = width <= 36 || height <= 36;

  return (
    <div
      {...props}
      className={cn("relative", className)}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        ...style,
      }}
    >
      <ItemPreviewDropTarget slot={slot} width={width} height={height} />
      <EditableItemCount slot={slot} compact={compactCount} />
    </div>
  );
};
