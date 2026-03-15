import { useLayoutEffect, useRef, useState } from "react";

import { createPortal } from "react-dom";

import { useIsTouchDevice } from "@/hooks/use-is-touch-device";

type TooltipProps = {
  content: string;
  children: React.ReactNode;
};

const GAP = 8;

const TooltipInner = ({ content, children }: TooltipProps) => {
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

    let left = rect.right + GAP;
    const top = rect.top + rect.height / 2 - tooltipHeight / 2;

    if (left + tooltipWidth + GAP > window.innerWidth) {
      left = rect.left - tooltipWidth - GAP;
    }

    setPosition({ top, left });
  }, [isHovering]);

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
            className="pointer-events-none fixed z-50 whitespace-nowrap rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md"
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
