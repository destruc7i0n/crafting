import { RecipeSlot } from "@/data/types";
import { cn } from "@/lib/utils";

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
      <EditableItemCount slot={slot} />
    </div>
  );
};
