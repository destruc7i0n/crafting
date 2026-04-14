import { useEffect, useId } from "react";
import { createPortal } from "react-dom";

import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type DialogSize = "sm" | "md" | "lg" | "xl";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: DialogSize;
  overlayClassName?: string;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  closeLabel?: string;
};

const sizeClassNames: Record<DialogSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

let openDialogCount = 0;
let bodyOverflowBeforeLock: string | null = null;

export const Dialog = ({
  open,
  onClose,
  title,
  description,
  icon,
  children,
  footer,
  size = "md",
  overlayClassName,
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
  titleClassName,
  descriptionClassName,
  closeLabel = "Close dialog",
}: DialogProps) => {
  const titleId = useId();
  const descriptionId = description ? useId() : undefined;

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (openDialogCount === 0) {
      bodyOverflowBeforeLock = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }

    openDialogCount += 1;
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      openDialogCount = Math.max(0, openDialogCount - 1);

      if (openDialogCount === 0) {
        document.body.style.overflow = bodyOverflowBeforeLock ?? "";
        bodyOverflowBeforeLock = null;
      }
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-3 sm:p-4",
        overlayClassName,
      )}
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn(
          "border-border bg-background text-foreground flex max-h-[min(42rem,calc(100svh-3rem))] min-h-0 w-full flex-col overflow-hidden rounded-lg border shadow-2xl",
          sizeClassNames[size],
          className,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={cn(
            "border-border flex items-start gap-3 border-b px-4 py-3 sm:px-5 sm:py-4",
            headerClassName,
          )}
        >
          {icon ? <div className="shrink-0">{icon}</div> : null}

          <div className="min-w-0 flex-1 space-y-1">
            <h2 id={titleId} className={cn("text-lg font-semibold", titleClassName)}>
              {title}
            </h2>
            {description ? (
              <p
                id={descriptionId}
                className={cn("text-muted-foreground text-sm leading-6", descriptionClassName)}
              >
                {description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer rounded-md p-2 transition-colors"
            aria-label={closeLabel}
          >
            <XIcon size={18} />
          </button>
        </div>

        <div className={cn("min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5", bodyClassName)}>
          {children}
        </div>

        {footer ? (
          <div className={cn("border-border border-t px-4 py-3 sm:px-5 sm:py-4", footerClassName)}>
            {footer}
          </div>
        ) : null}
      </section>
    </div>,
    document.body,
  );
};
