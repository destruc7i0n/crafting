import type { ComponentProps } from "react";

import { Drawer } from "@base-ui/react/drawer";

import { cn } from "@/lib/utils";

// bottom sheet with dismissal gestures confined to its header and handle
export function PickerDrawer({
  onClose,
  className,
  children,
  ...props
}: ComponentProps<typeof Drawer.Popup> & { onClose: () => void }) {
  return (
    <Drawer.Root
      open
      swipeDirection="down"
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Drawer.VirtualKeyboardProvider>
        <Drawer.Portal>
          <Drawer.Backdrop className="bg-overlay fixed inset-0 z-[100]" />
          <Drawer.Viewport className="fixed inset-0 z-[100] flex items-end pb-[var(--drawer-keyboard-inset,0px)]">
            <Drawer.Popup
              {...props}
              className={cn(
                "translate-y-[var(--drawer-swipe-movement-y,0px)] transition-transform duration-200 data-[swiping]:transition-none motion-reduce:transition-none",
                className,
              )}
            >
              <div aria-hidden="true" className="flex shrink-0 justify-center pt-3 pb-1">
                <div className="bg-muted-foreground/40 h-1 w-9 rounded-full" />
              </div>
              {children}
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.VirtualKeyboardProvider>
    </Drawer.Root>
  );
}
