import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Slot } from "../slot/slot";

interface IngredientCardProps {
  children: ReactNode;
  label: string;
  sublabel?: string;
  onClick?: () => void;
  actions?: ReactNode;
  className?: string;
}

export const IngredientCard = ({
  children,
  label,
  sublabel,
  onClick,
  actions,
  className,
}: IngredientCardProps) => {
  const content = (
    <>
      <span className="truncate text-xs font-medium sm:text-sm" title={label}>
        {label}
      </span>
      {sublabel && (
        <span className="text-muted-foreground truncate text-[10px] sm:text-xs" title={sublabel}>
          {sublabel}
        </span>
      )}
    </>
  );

  return (
    <div
      className={cn(
        "border-border bg-muted/50 flex min-w-0 items-start gap-1.5 rounded-md border p-1 sm:gap-2 sm:p-1.5",
        className,
      )}
    >
      <Slot className="shrink-0">{children}</Slot>

      {onClick ? (
        <button
          type="button"
          className={cn(
            "flex min-w-0 flex-1 cursor-pointer flex-col overflow-hidden text-left",
            sublabel && "pt-0.5",
          )}
          onClick={onClick}
        >
          {content}
        </button>
      ) : (
        <div className={cn("flex min-w-0 flex-1 flex-col overflow-hidden", sublabel && "pt-0.5")}>
          {content}
        </div>
      )}

      {actions && <div className="flex shrink-0 items-center gap-0.5 self-center">{actions}</div>}
    </div>
  );
};
