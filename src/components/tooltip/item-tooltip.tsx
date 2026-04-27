import { useState } from "react";
import { createPortal } from "react-dom";

import {
  flip,
  offset,
  shift,
  useClientPoint,
  useFloating,
  useHover,
  useInteractions,
} from "@floating-ui/react";

import { useIsTouchDevice } from "@/hooks/use-is-touch-device";

import { TooltipDisplay } from "./tooltip-display";

type TooltipProps = {
  title: string;
  description: string;
  visible?: boolean;
  className?: string;
  children: React.ReactNode;
};

const TooltipDesktop = ({
  title,
  description,
  children,
  visible = true,
  className,
}: TooltipProps) => {
  const [isHovering, setIsHovering] = useState(false);

  const shouldShowTooltip = isHovering && visible;

  const { refs, floatingStyles, isPositioned, context } = useFloating({
    open: shouldShowTooltip,
    onOpenChange: setIsHovering,
    placement: "right",
    strategy: "fixed",
    middleware: [
      offset(16),
      flip({ padding: 8, fallbackPlacements: ["left", "top"] }),
      shift({ padding: 8 }),
    ],
  });

  const hover = useHover(context, { mouseOnly: true });
  const clientPoint = useClientPoint(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, clientPoint]);

  return (
    <div ref={refs.setReference} className={className} {...getReferenceProps()}>
      {children}

      {shouldShowTooltip &&
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
    if (props.className) {
      return <div className={props.className}>{props.children}</div>;
    }

    return <>{props.children}</>;
  }

  return <TooltipDesktop {...props} />;
};
