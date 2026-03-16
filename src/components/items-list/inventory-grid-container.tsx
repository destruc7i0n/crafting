import { ComponentPropsWithoutRef, forwardRef } from "react";

import { cn } from "@/lib/utils";

type InventoryGridContainerProps = ComponentPropsWithoutRef<"div">;

export const InventoryGridContainer = forwardRef<HTMLDivElement, InventoryGridContainerProps>(
  ({ className, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      className={cn(
        "min-h-0 flex-1 overflow-y-auto rounded-md bg-minecraft-inventory-bg p-1",
        className,
      )}
    />
  ),
);

InventoryGridContainer.displayName = "InventoryGridContainer";
