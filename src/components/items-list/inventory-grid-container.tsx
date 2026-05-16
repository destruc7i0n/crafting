import type { ComponentPropsWithRef } from "react";

import { cn } from "@/lib/utils";

type InventoryGridContainerProps = ComponentPropsWithRef<"div">;

export function InventoryGridContainer({ ref, className, ...props }: InventoryGridContainerProps) {
  return (
    <div
      {...props}
      ref={ref}
      className={cn(
        "bg-minecraft-inventory-bg ring-border/70 scrollbar-app min-h-0 flex-1 overflow-y-auto rounded-md p-1 ring-1 ring-inset",
        className,
      )}
    />
  );
}
