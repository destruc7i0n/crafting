import { forwardRef } from "react";

import { cn } from "@/lib/utils";

type GridItemProps = {
  width?: number;
  height?: number;
  hover?: boolean;
  children?: React.ReactNode;
};

export const GridItem = forwardRef<HTMLDivElement, GridItemProps>(
  ({ width = 36, height = 36, hover, children }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex items-center justify-center border-2 border-b-white border-l-[#373737] border-r-white border-t-[#373737] bg-[#8b8b8b] ",
          hover ? "bg-white/40" : "hover:bg-white/40",
        )}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        {children}
      </div>
    );
  },
);
