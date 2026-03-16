import { type ComponentProps, type ReactNode } from "react";

import { CircleHelpIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/tooltip/tooltip";

interface HelpTooltipProps {
  content: string;
}

export const HelpTooltip = ({ content }: HelpTooltipProps) => (
  <Tooltip content={content} placement="top">
    <span className="shrink-0 text-muted-foreground/70 transition-colors hover:text-foreground">
      <CircleHelpIcon size={14} />
    </span>
  </Tooltip>
);

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  tooltip?: string;
  className?: string;
}

export const CheckboxField = ({
  label,
  checked,
  onCheckedChange,
  tooltip,
  className,
}: CheckboxFieldProps) => (
  <div className={cn("flex items-center gap-1.5", className)}>
    <label className="flex select-none items-center gap-2 text-sm text-foreground">
      <input
        type="checkbox"
        className="accent-primary"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
      />
      {label}
    </label>

    {tooltip && <HelpTooltip content={tooltip} />}
  </div>
);

interface FieldProps {
  label: string;
  children: ReactNode;
  htmlFor?: string;
  tooltip?: string;
  error?: ReactNode;
  className?: string;
}

export const Field = ({ label, children, htmlFor, tooltip, error, className }: FieldProps) => (
  <div className={cn("flex flex-col gap-1 text-sm text-foreground", className)}>
    <div className="flex items-center gap-1.5">
      {htmlFor ? <label htmlFor={htmlFor}>{label}</label> : <span>{label}</span>}
      {tooltip && <HelpTooltip content={tooltip} />}
    </div>

    {children}
    {error}
  </div>
);

type InputControlProps = ComponentProps<"input">;

export const InputControl = ({ className, ...props }: InputControlProps) => (
  <input
    {...props}
    className={cn(
      "h-9 rounded-md border border-input bg-background px-2 py-1 text-foreground outline-hidden transition-colors hover:bg-accent focus:ring-2 focus:ring-inset focus:ring-ring",
      className,
    )}
  />
);
