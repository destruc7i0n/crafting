import { ComponentPropsWithoutRef, forwardRef, memo } from "react";

import classes from "./tooltip.module.css";

type TooltipProps = {
  title: string;
  description: string;
} & ComponentPropsWithoutRef<"div">;

export const TooltipDisplay = memo(
  forwardRef<HTMLDivElement, TooltipProps>(
    ({ title, description, ...props }, ref) => {
      return (
        <div ref={ref} className={classes.tooltip} {...props}>
          <div className={classes.tooltipTitle}>{title}</div>
          <div className={classes.tooltipDescription}>{description}</div>
        </div>
      );
    },
  ),
);

TooltipDisplay.displayName = "TooltipDisplay";
