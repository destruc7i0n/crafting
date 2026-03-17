import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useIsTouchDevice } from "@/hooks/use-is-touch-device";
import { computePosition, type Placement } from "@/lib/popup-position";

type TooltipProps = {
  content: string;
  children: React.ReactNode;
  placement?: Placement;
};

const TooltipInner = ({ content, children, placement = "right" }: TooltipProps) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!isHovering) return;

    const trigger = triggerRef.current;
    const tooltip = tooltipRef.current;
    if (!trigger || !tooltip) return;

    const rect = trigger.getBoundingClientRect();
    const { width: tooltipWidth, height: tooltipHeight } = tooltip.getBoundingClientRect();

    setPosition(computePosition(placement, rect, tooltipWidth, tooltipHeight));
  }, [isHovering, placement]);

  return (
    <div
      ref={triggerRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setPosition(null);
      }}
    >
      {children}

      {isHovering &&
        createPortal(
          <div
            ref={tooltipRef}
            className="border-border bg-popover text-popover-foreground pointer-events-none fixed z-50 max-w-72 rounded-md border px-2.5 py-1.5 text-xs leading-snug shadow-md"
            style={
              position ? { top: `${position.top}px`, left: `${position.left}px` } : { opacity: 0 }
            }
          >
            {content}
          </div>,
          document.body,
        )}
    </div>
  );
};

export const Tooltip = (props: TooltipProps) => {
  const isTouchDevice = useIsTouchDevice();

  if (isTouchDevice) {
    return <>{props.children}</>;
  }

  return <TooltipInner {...props} />;
};
