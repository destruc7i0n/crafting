import { memo, type ComponentPropsWithRef } from "react";

import classes from "./tooltip.module.css";

type TooltipProps = {
  title: string;
  description: string;
} & ComponentPropsWithRef<"div">;

export const TooltipDisplay = memo(function TooltipDisplay({
  ref,
  title,
  description,
  ...props
}: TooltipProps) {
  const showDescription = description && !title.includes(description);

  return (
    <div ref={ref} className={classes.tooltip} {...props}>
      <div className={classes.tooltipTitle}>{title}</div>
      {showDescription && <div className={classes.tooltipDescription}>{description}</div>}
    </div>
  );
});
