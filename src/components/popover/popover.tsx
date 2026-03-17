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

type PopoverProps = {
  content: string;
  children: React.ReactNode;
  placement?: Placement;
};

export const Popover = ({ content, children, placement = "right" }: PopoverProps) => {
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
    <div ref={refs.setReference} {...getReferenceProps()}>
      {children}

      {isOpen &&
        createPortal(
          <div
            ref={refs.setFloating}
            className="border-border bg-popover text-popover-foreground fixed z-50 max-w-72 rounded-md border px-2.5 py-1.5 text-xs leading-snug shadow-md"
            style={{ ...floatingStyles, ...(!isPositioned ? { visibility: "hidden" } : {}) }}
            {...getFloatingProps()}
          >
            {content}
          </div>,
          document.body,
        )}
    </div>
  );
};
