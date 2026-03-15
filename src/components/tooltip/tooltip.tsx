import { useLayoutEffect, useRef, useState } from "react";

import { createPortal } from "react-dom";

import { useIsTouchDevice } from "@/hooks/use-is-touch-device";

type TooltipProps = {
  content: string;
  children: React.ReactNode;
  placement?: "top" | "right" | "bottom" | "left";
};

const GAP = 8;
const VIEWPORT_PADDING = 8;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

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

    const getPosition = (side: NonNullable<TooltipProps["placement"]>) => {
      switch (side) {
        case "top":
          return {
            top: rect.top - tooltipHeight - GAP,
            left: rect.left + rect.width / 2 - tooltipWidth / 2,
          };
        case "bottom":
          return {
            top: rect.bottom + GAP,
            left: rect.left + rect.width / 2 - tooltipWidth / 2,
          };
        case "left":
          return {
            top: rect.top + rect.height / 2 - tooltipHeight / 2,
            left: rect.left - tooltipWidth - GAP,
          };
        case "right":
        default:
          return {
            top: rect.top + rect.height / 2 - tooltipHeight / 2,
            left: rect.right + GAP,
          };
      }
    };

    const getFallbackPlacement = (side: NonNullable<TooltipProps["placement"]>) => {
      switch (side) {
        case "top":
          return "bottom";
        case "bottom":
          return "top";
        case "left":
          return "right";
        case "right":
        default:
          return "left";
      }
    };

    let nextPosition = getPosition(placement);

    if (placement === "top" && nextPosition.top < VIEWPORT_PADDING) {
      nextPosition = getPosition(getFallbackPlacement(placement));
    }

    if (
      placement === "bottom" &&
      nextPosition.top + tooltipHeight > window.innerHeight - VIEWPORT_PADDING
    ) {
      nextPosition = getPosition(getFallbackPlacement(placement));
    }

    if (placement === "left" && nextPosition.left < VIEWPORT_PADDING) {
      nextPosition = getPosition(getFallbackPlacement(placement));
    }

    if (
      placement === "right" &&
      nextPosition.left + tooltipWidth > window.innerWidth - VIEWPORT_PADDING
    ) {
      nextPosition = getPosition(getFallbackPlacement(placement));
    }

    const left = clamp(
      nextPosition.left,
      VIEWPORT_PADDING,
      Math.max(VIEWPORT_PADDING, window.innerWidth - tooltipWidth - VIEWPORT_PADDING),
    );
    const top = clamp(
      nextPosition.top,
      VIEWPORT_PADDING,
      Math.max(VIEWPORT_PADDING, window.innerHeight - tooltipHeight - VIEWPORT_PADDING),
    );

    setPosition({ top, left });
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
            className="pointer-events-none fixed z-50 max-w-72 rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs leading-snug text-popover-foreground shadow-md"
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
