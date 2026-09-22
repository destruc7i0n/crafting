import { Dialog as BaseDialog } from "@base-ui/react/dialog";
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
  return (
    <BaseDialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="bg-overlay fixed inset-0 z-50" />
        <BaseDialog.Viewport
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-4",
            overlayClassName,
          )}
        >
          <BaseDialog.Popup
            className={cn(
              "border-border bg-background text-foreground flex max-h-[min(42rem,calc(100svh-3rem))] min-h-0 w-full flex-col overflow-hidden rounded-lg border",
              sizeClassNames[size],
              className,
            )}
          >
            <div
              className={cn(
                "border-border flex items-start gap-3 border-b px-4 py-3 sm:px-5 sm:py-4",
                headerClassName,
              )}
            >
              {icon ? <div className="shrink-0">{icon}</div> : null}

              <div className="min-w-0 flex-1 space-y-1">
                <BaseDialog.Title className={cn("text-lg font-semibold", titleClassName)}>
                  {title}
                </BaseDialog.Title>
                {description ? (
                  <BaseDialog.Description
                    className={cn("text-muted-foreground text-sm leading-6", descriptionClassName)}
                  >
                    {description}
                  </BaseDialog.Description>
                ) : null}
              </div>

              <BaseDialog.Close
                className="text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer rounded-md p-2 transition-colors"
                aria-label={closeLabel}
              >
                <XIcon size={18} />
              </BaseDialog.Close>
            </div>

            <div
              className={cn(
                "scrollbar-app min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5",
                bodyClassName,
              )}
            >
              {children}
            </div>

            {footer ? (
              <div
                className={cn("border-border border-t px-4 py-3 sm:px-5 sm:py-4", footerClassName)}
              >
                {footer}
              </div>
            ) : null}
          </BaseDialog.Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
};
