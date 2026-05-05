import { ComponentPropsWithoutRef, forwardRef } from "react";

import { cn } from "@/lib/utils";

export const SLOT_SIZE = 36;
export const LARGE_SLOT_SIZE = 52;

export type SlotProps = {
  width?: number;
  height?: number;
  active?: boolean;
  inert?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
} & ComponentPropsWithoutRef<"div">;

import classes from "./slot.module.css";

export const Slot = forwardRef<HTMLDivElement, SlotProps>(
  ({ width = SLOT_SIZE, height = SLOT_SIZE, active, inert, disabled, children, ...props }, ref) => {
    return (
      <div
        {...props}
        ref={ref}
        className={cn(
          classes.slot,
          active && classes.active,
          inert && classes.inert,
          disabled && classes.disabled,
          props.className,
        )}
        style={{
          width,
          height,
          ...props["style"],
        }}
      >
        {children}
      </div>
    );
  },
);

Slot.displayName = "Slot";
