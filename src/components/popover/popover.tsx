import { useState } from "react";
import { createPortal } from "react-dom";

import {
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  type Placement,
} from "@floating-ui/react";

import { cn } from "@/lib/utils";

type PopoverProps = {
  content: React.ReactNode;
  children: React.ReactNode;
  placement?: Placement;
  className?: string;
};

export const Popover = ({ content, children, placement = "right", className }: PopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, isPositioned, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    strategy: "fixed",
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context, { ancestorScroll: true });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  return (
    <span ref={refs.setReference} {...getReferenceProps()}>
      {children}

      {isOpen &&
        createPortal(
          <div
            ref={refs.setFloating}
            className={cn(
              "border-border bg-popover text-popover-foreground fixed z-50 rounded-md border shadow-md",
              className,
            )}
            style={{ ...floatingStyles, ...(!isPositioned ? { visibility: "hidden" } : {}) }}
            {...getFloatingProps()}
          >
            {content}
          </div>,
          document.body,
        )}
    </span>
  );
};
