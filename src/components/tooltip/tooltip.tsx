import { useState } from "react";
import { createPortal } from "react-dom";

import {
  flip,
  offset,
  shift,
  useFloating,
  useHover,
  useInteractions,
  type Placement,
} from "@floating-ui/react";

import { useIsTouchDevice } from "@/hooks/use-is-touch-device";

type TooltipProps = {
  content: React.ReactNode;
  children: React.ReactNode;
  placement?: Placement;
  disabled?: boolean;
};

const TooltipInner = ({ content, children, placement = "right" }: TooltipProps) => {
  const [isHovering, setIsHovering] = useState(false);

  const { refs, floatingStyles, isPositioned, context } = useFloating({
    open: isHovering,
    onOpenChange: setIsHovering,
    placement,
    strategy: "fixed",
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });

  const hover = useHover(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

  return (
    <span ref={refs.setReference} {...getReferenceProps()}>
      {children}

      {isHovering &&
        createPortal(
          <div
            ref={refs.setFloating}
            className="border-border bg-popover text-popover-foreground pointer-events-none fixed z-50 max-w-72 rounded-md border px-2.5 py-1.5 text-xs leading-snug shadow-md"
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

export const Tooltip = (props: TooltipProps) => {
  const isTouchDevice = useIsTouchDevice();

  if (isTouchDevice || props.disabled) {
    return <>{props.children}</>;
  }

  return <TooltipInner {...props} />;
};
