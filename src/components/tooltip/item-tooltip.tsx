import { useCallback, useLayoutEffect, useRef, useState } from "react";

import { createPortal } from "react-dom";

import { useIsTouchDevice } from "@/hooks/use-is-touch-device";

import { TooltipDisplay } from "./tooltip-display";

type TooltipProps = {
  title: string;
  description: string;
  visible?: boolean;
  children: React.ReactNode;
};

const TOOLTIP_OFFSET = 20;

const positionTooltip = (tooltipEl: HTMLDivElement, mouseX: number, mouseY: number) => {
  const { width, height } = tooltipEl.getBoundingClientRect();

  let left = mouseX + TOOLTIP_OFFSET;
  const top = mouseY - height / 2;

  if (mouseX + width + TOOLTIP_OFFSET + 8 > document.body.clientWidth) {
    left = mouseX - width - TOOLTIP_OFFSET;
  }

  tooltipEl.style.top = `${top}px`;
  tooltipEl.style.left = `${left}px`;
};

const TooltipDesktop = ({ title, description, children, visible = true }: TooltipProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const shouldShowTooltip = isHovering && visible;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = tooltipRef.current;
    if (el) positionTooltip(el, e.clientX, e.clientY);
  }, []);

  useLayoutEffect(() => {
    if (!shouldShowTooltip) return;
    const el = tooltipRef.current;
    const wrapper = wrapperRef.current;
    if (!el || !wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    positionTooltip(el, rect.left + rect.width / 2, rect.top + rect.height / 2);
  }, [shouldShowTooltip]);

  return (
    <div
      ref={wrapperRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
    >
      {children}

      {shouldShowTooltip &&
        createPortal(
          <TooltipDisplay ref={tooltipRef} title={title} description={description} />,
          document.body,
        )}
    </div>
  );
};

export const ItemTooltip = (props: TooltipProps) => {
  const isTouchDevice = useIsTouchDevice();

  if (isTouchDevice) {
    return <>{props.children}</>;
  }

  return <TooltipDesktop {...props} />;
};
