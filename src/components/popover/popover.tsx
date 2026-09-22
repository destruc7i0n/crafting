import { isValidElement, useState, type ReactNode } from "react";

import { Popover as BasePopover } from "@base-ui/react/popover";

import { cn } from "@/lib/utils";

export const popoverSurfaceClassName =
  "border-border bg-popover text-popover-foreground rounded-md border shadow-md";

type Placement =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | `${"top" | "bottom" | "left" | "right"}-${"start" | "end"}`;
type PopoverProps = {
  content: ReactNode;
  children: ReactNode;
  placement?: Placement;
  className?: string;
  open?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

export const Popover = ({
  content,
  children,
  placement = "right",
  className,
  open,
  onOpenChange,
}: PopoverProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [side, align = "center"] = placement.split("-") as [
    "top" | "bottom" | "left" | "right",
    ("start" | "end" | "center")?,
  ];
  const trigger = isValidElement(children) ? children : <span>{children}</span>;
  return (
    <BasePopover.Root
      open={open ?? uncontrolledOpen}
      modal={false}
      onOpenChange={(next) => {
        setUncontrolledOpen(next);
        onOpenChange?.(next);
      }}
    >
      <BasePopover.Trigger render={trigger} nativeButton={trigger.type === "button"} />
      <BasePopover.Portal>
        <BasePopover.Positioner
          side={side}
          align={align}
          sideOffset={8}
          collisionPadding={8}
          className="z-50"
        >
          <BasePopover.Popup className={cn(popoverSurfaceClassName, className)}>
            {content}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
};
