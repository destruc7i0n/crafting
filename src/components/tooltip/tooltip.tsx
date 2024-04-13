import { useCallback, useLayoutEffect, useRef, useState } from "react";

import { createPortal } from "react-dom";

import { TooltipDisplay } from "./tooltip-display";

type TooltipProps = {
  title: string;
  description: string;
  visible?: boolean;
  children: React.ReactNode;
};

const TOOLTIP_OFFSET = 20;

export const Tooltip = ({
  title,
  description,
  children,
  visible = true,
}: TooltipProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [tooltipDimensions, setTooltipDimensions] = useState<[number, number]>([
    0, 0,
  ]);
  const [isHovering, setIsHovering] = useState(false);
  const [mouseCoords, setMouseCoords] = useState<[number, number]>([0, 0]);

  const shouldShowTooltip = isHovering && visible;

  useLayoutEffect(() => {
    const el = tooltipRef.current;
    if (!shouldShowTooltip || !el) return;

    // calculate the width of the tooltip before render
    const { width, height } = el.getBoundingClientRect();
    setTooltipDimensions([width, height]);
  }, [shouldShowTooltip]);

  const handleMouseMove = useCallback(
    (e: Pick<MouseEvent, "clientX" | "clientY">) => {
      setMouseCoords([e.clientX, e.clientY]);
    },
    [],
  );

  // calculate the position of the tooltip based on the mouse position
  const [mouseX, mouseY] = mouseCoords;
  const [tooltipWidth, tooltipHeight] = tooltipDimensions;
  let left = mouseX + TOOLTIP_OFFSET; // offset the tooltip to the right
  const top = mouseY - tooltipHeight / 2; // center the tooltip vertically

  // if the tooltip is going off the right side of the screen, move it to the left
  if (mouseX + tooltipWidth + 20 > document.body.clientWidth) {
    left = mouseX - tooltipWidth - TOOLTIP_OFFSET;
  }

  // mousemove might not have been triggered yet
  const shouldRenderTooltip = shouldShowTooltip && top > 0;

  return (
    <div
      ref={ref}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={(e) => handleMouseMove(e)}
    >
      {children}

      {shouldRenderTooltip &&
        createPortal(
          <TooltipDisplay
            ref={tooltipRef}
            title={title}
            description={description}
            style={{
              top: `${top}px`,
              left: `${left}px`,
            }}
          />,
          document.body,
        )}
    </div>
  );
};
