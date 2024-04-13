import { useCallback, useEffect, useRef, useState } from "react";

import { createPortal } from "react-dom";

import { TooltipDisplay } from "./tooltip-display";

type TooltipProps = {
  title: string;
  description: string;
  visible?: boolean;
  children: React.ReactNode;
};

export const Tooltip = ({
  title,
  description,
  children,
  visible = true,
}: TooltipProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [isHovering, setIsHovering] = useState(false);
  const [tooltipCoords, setTooltipCoords] = useState<[number, number]>([0, 0]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setTooltipCoords([0, 0]);
  }, []);

  useEffect(() => {
    const el = ref.current;

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      const tooltipEl = tooltipRef.current;

      // wait for tooltip to be rendered before calculating width
      if (tooltipEl) {
        const width = tooltipEl.getBoundingClientRect().width;

        let left = x;
        if (x + width + 20 > document.body.clientWidth) {
          left = x - width;
        }

        setTooltipCoords([left, y]);
      }
    };

    el?.addEventListener("mousemove", handleMouseMove);
    return () => el?.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const shouldShowTooltip =
    isHovering && !!tooltipCoords[0] && !!tooltipCoords[1] && visible;

  return (
    <div
      ref={ref}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleMouseLeave}
      onMouseOver={() => setIsHovering(true)}
    >
      {children}

      {isHovering &&
        createPortal(
          <TooltipDisplay
            ref={tooltipRef}
            title={title}
            description={description}
            style={{
              visibility: shouldShowTooltip ? "visible" : "hidden",
              top: `${tooltipCoords[1]}px`,
              left: `${tooltipCoords[0]}px`,
            }}
          />,
          document.body,
        )}
    </div>
  );
};
