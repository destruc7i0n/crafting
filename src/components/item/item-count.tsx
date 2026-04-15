import { cn } from "@/lib/utils";

import classes from "./item-count.module.css";

export const ItemCount = ({
  count,
  className,
  compact = false,
}: {
  count: number;
  className?: string;
  compact?: boolean;
}) => (
  <span
    className={cn(
      "font-minecraft pointer-events-none absolute right-1 bottom-1 text-center text-[16px] text-white select-none",
      compact && "block min-w-[10px] text-right leading-none",
      classes.itemCount,
      className,
    )}
  >
    {count}
  </span>
);
