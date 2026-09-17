import { memo, type ComponentPropsWithRef } from "react";

import classes from "./tooltip.module.css";

type TooltipProps = {
  title: string;
  description: string;
  tooltipLines?: readonly string[];
} & ComponentPropsWithRef<"div">;

export const TooltipDisplay = memo(function TooltipDisplay({
  ref,
  title,
  description,
  tooltipLines,
  ...props
}: TooltipProps) {
  const showDescription = description && !title.includes(description);

  return (
    <div ref={ref} className={classes.tooltip} {...props}>
      <div className={classes.tooltipTitle}>{title}</div>
      {tooltipLines?.map((line) => (
        <div
          key={line}
          className={classes.tooltipEffect}
          data-harmful={/^(Instant Damage|Slowness|Poison|Weakness|Wind Charged|Weaving|Oozing|Infested)(?: |$)/.test(
            line,
          )}
        >
          {line}
        </div>
      ))}
      {showDescription && <div className={classes.tooltipDescription}>{description}</div>}
    </div>
  );
});
