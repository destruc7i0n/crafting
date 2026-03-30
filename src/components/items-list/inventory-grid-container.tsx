import { ComponentPropsWithoutRef, forwardRef } from "react";

import { cn } from "@/lib/utils";

type InventoryGridContainerProps = ComponentPropsWithoutRef<"div">;

export const InventoryGridContainer = forwardRef<HTMLDivElement, InventoryGridContainerProps>(
  ({ className, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      className={cn(
        "bg-minecraft-inventory-bg ring-border/70 min-h-0 flex-1 overflow-y-auto rounded-md p-1 ring-1 ring-inset",
        className,
      )}
    />
  ),
);

InventoryGridContainer.displayName = "InventoryGridContainer";
