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
          "border-input bg-background text-foreground hover:bg-accent focus:ring-ring h-9 w-full appearance-none rounded-md border px-3 py-2 pr-8 text-sm leading-tight outline-hidden transition-colors focus:ring-2 focus:ring-inset",
          className,
        )}
      >
        {children}
      </select>

      <ChevronDownIcon
        size={16}
        className={cn(
          "text-muted-foreground pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2",
          iconClassName,
        )}
      />
    </div>
  );
};
