import { ComponentPropsWithoutRef, forwardRef } from "react";

import { cn } from "@/lib/utils";

export type GridItemProps = {
  width?: number;
  height?: number;
  hover?: boolean;
  children?: React.ReactNode;
} & ComponentPropsWithoutRef<"div">;

import classes from "./slot.module.css";

export const GridItem = forwardRef<HTMLDivElement, GridItemProps>(
  ({ width = 36, height = 36, hover, children, ...props }, ref) => {
    return (
      <div
        {...props}
        ref={ref}
        className={cn(classes.slot, hover && classes.active)}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          ...props["style"],
        }}
      >
        {children}
      </div>
    );
  },
);

GridItem.displayName = "GridItem";
