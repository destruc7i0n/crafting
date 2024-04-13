import { ComponentProps } from "react";

import classes from "./tooltip.module.css";
console.log(classes);

type TooltipProps = {
  title: string;
  description: string;
} & ComponentProps<"div">;

export const TooltipDisplay = ({
  title,
  description,
  ...props
}: TooltipProps) => {
  return (
    <div className={classes.tooltip} {...props}>
      <div className={classes.tooltipTitle}>{title}</div>
      <div className={classes.tooltipDescription}>{description}</div>
    </div>
  );
};
