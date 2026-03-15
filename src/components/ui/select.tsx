import { type ComponentPropsWithoutRef } from "react";

import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type SelectProps = ComponentPropsWithoutRef<"select"> & {
  wrapperClassName?: string;
  iconClassName?: string;
};

export const Select = ({
  className,
  wrapperClassName,
  iconClassName,
  children,
  ...props
}: SelectProps) => {
  return (
    <div className={cn("relative", wrapperClassName)}>
      <select
        {...props}
        className={cn(
          "h-9 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm leading-tight text-foreground outline-none transition-colors hover:bg-accent focus:ring-2 focus:ring-inset focus:ring-ring",
          className,
        )}
      >
        {children}
      </select>

      <ChevronDownIcon
        size={16}
        className={cn(
          "pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground",
          iconClassName,
        )}
      />
    </div>
  );
};
