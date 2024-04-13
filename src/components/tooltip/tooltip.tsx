import { useEffect, useRef, useState } from "react";

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

  const [isHovering, setIsHovering] = useState(false);
  const [tooltipCoords, setTooltipCoords] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    const el = ref.current;

    const onMove = (e: MouseEvent) => {
      if (el) {
        const x = e.clientX;
        const y = e.clientY;

        setTooltipCoords([x, y]);
      }
    };

    el?.addEventListener("pointermove", onMove);
    return () => el?.removeEventListener("pointermove", onMove);
  }, []);

  const shouldShowTooltip =
    isHovering && !!tooltipCoords[0] && !!tooltipCoords[1] && visible;

  return (
    <div
      ref={ref}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseOver={() => setIsHovering(true)}
    >
      {children}

      {shouldShowTooltip &&
        createPortal(
          <TooltipDisplay
            title={title}
            description={description}
            style={{
              top: tooltipCoords[1],
              left: tooltipCoords[0],
            }}
          />,
          document.body,
        )}
    </div>
  );
};
