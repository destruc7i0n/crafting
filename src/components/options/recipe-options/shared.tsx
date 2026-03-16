import { type ComponentProps, type ReactNode } from "react";

import { CircleHelpIcon } from "lucide-react";

import { Tooltip } from "@/components/tooltip/tooltip";
import { cn } from "@/lib/utils";

interface HelpTooltipProps {
  content: string;
}

export const HelpTooltip = ({ content }: HelpTooltipProps) => (
  <Tooltip content={content} placement="top">
    <span className="text-muted-foreground/70 hover:text-foreground shrink-0 transition-colors">
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
    <label className="text-foreground flex items-center gap-2 text-sm select-none">
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
  <div className={cn("text-foreground flex flex-col gap-1 text-sm", className)}>
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
      "border-input bg-background text-foreground hover:bg-accent focus:ring-ring h-9 rounded-md border px-2 py-1 outline-hidden transition-colors focus:ring-2 focus:ring-inset",
      className,
    )}
  />
);
