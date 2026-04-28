import { useState } from "react";
import { createPortal } from "react-dom";

import {
  flip,
  offset,
  shift,
  useClick,
  useClientPoint,
  useDismiss,
  useFloating,
  useHover,
  useInteractions,
  type Placement,
} from "@floating-ui/react";

import { useIsTouchDevice } from "@/hooks/use-is-touch-device";

import { TooltipDisplay } from "./tooltip-display";

type TooltipProps = {
  title: string;
  description: string;
  visible?: boolean;
  className?: string;
  touchBehavior?: "disabled" | "tap";
  children: React.ReactNode;
};

type TooltipInnerProps = TooltipProps & {
  mode: "hover" | "tap";
  placement: Placement;
};

const TooltipInner = ({
  title,
  description,
  children,
  visible = true,
  className,
  mode,
  placement,
}: TooltipInnerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const shouldShowTooltip = isOpen && visible;

  const { refs, floatingStyles, isPositioned, context } = useFloating({
    open: shouldShowTooltip,
    onOpenChange: setIsOpen,
    placement,
    strategy: "fixed",
    middleware: [
      offset(mode === "tap" ? 12 : 16),
      flip({
        padding: 8,
        fallbackPlacements: mode === "tap" ? ["bottom", "top"] : ["left", "top"],
      }),
      shift({ padding: 8 }),
    ],
  });

  const hover = useHover(context, { enabled: mode === "hover", mouseOnly: true });
  const clientPoint = useClientPoint(context, { enabled: mode === "hover" });
  const click = useClick(context, { enabled: mode === "tap", ignoreMouse: true });
  const dismiss = useDismiss(context, { enabled: mode === "tap", ancestorScroll: true });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    clientPoint,
    click,
    dismiss,
  ]);

  return (
    <div ref={refs.setReference} className={className} {...getReferenceProps()}>
      {children}

      {shouldShowTooltip &&
        typeof document !== "undefined" &&
        createPortal(
          <TooltipDisplay
            ref={refs.setFloating}
            title={title}
            description={description}
            style={{ ...floatingStyles, ...(!isPositioned ? { visibility: "hidden" } : {}) }}
            {...getFloatingProps()}
          />,
          document.body,
        )}
    </div>
  );
};

export const ItemTooltip = (props: TooltipProps) => {
  const isTouchDevice = useIsTouchDevice();

  if (isTouchDevice) {
    if (props.touchBehavior === "tap") {
      return <TooltipInner {...props} mode="tap" placement="bottom" />;
    }

    if (props.className) {
      return <div className={props.className}>{props.children}</div>;
    }

    return <>{props.children}</>;
  }

  return <TooltipInner {...props} mode="hover" placement="right" />;
};
