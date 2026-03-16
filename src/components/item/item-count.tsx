import { cn } from "@/lib/utils";

import classes from "./item-count.module.css";

export const ItemCount = ({ count, className }: { count: number; className?: string }) => (
  <span
    className={cn(
      "font-minecraft pointer-events-none absolute right-1 bottom-1 text-center text-[16px] text-white select-none",
      classes.itemCount,
      className,
    )}
  >
    {count}
  </span>
);
