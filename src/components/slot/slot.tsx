import type { ComponentPropsWithRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

export const SLOT_SIZE = 36;
export const LARGE_SLOT_SIZE = 52;

export type SlotProps = {
  width?: number;
  height?: number;
  active?: boolean;
  inert?: boolean;
  disabled?: boolean;
  transparent?: boolean;
  children?: ReactNode;
} & ComponentPropsWithRef<"div">;

import classes from "./slot.module.css";

export function Slot({
  ref,
  width = SLOT_SIZE,
  height = SLOT_SIZE,
  active,
  inert,
  disabled,
  transparent,
  children,
  className,
  style,
  ...props
}: SlotProps) {
  return (
    <div
      {...props}
      ref={ref}
      className={cn(
        classes.slot,
        active && classes.active,
        inert && classes.inert,
        disabled && classes.disabled,
        transparent && classes.transparent,
        className,
      )}
      style={{
        width,
        height,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
