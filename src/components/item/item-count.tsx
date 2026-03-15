import { cn } from "@/lib/utils";

import classes from "./item-count.module.css";

export const ItemCount = ({ count, className }: { count: number; className?: string }) => (
  <span
    className={cn(
      "pointer-events-none absolute bottom-1 right-1 select-none text-center font-minecraft text-[16px] text-white",
      classes.itemCount,
      className,
    )}
  >
    {count}
  </span>
);
