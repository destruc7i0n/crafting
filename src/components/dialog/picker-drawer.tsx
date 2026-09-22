import { useState, useSyncExternalStore, type ComponentProps } from "react";

import { Drawer } from "@base-ui/react/drawer";

import { cn } from "@/lib/utils";

import classes from "./picker-drawer.module.css";

const snapPoints = [0.55, 0.85];
const expandedSnapPoints = [snapPoints[1]];
const compactHeightQuery = "(min-height: 600px)";
const subscribeHeight = (listener: () => void) => {
  const query = window.matchMedia(compactHeightQuery);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
};
const supportsCompactHeight = () => window.matchMedia(compactHeightQuery).matches;
const serverCompactHeight = () => true;

// bottom sheet with resize and dismissal gestures confined to its header and handle
export function PickerDrawer({
  open,
  onClose,
  onCloseComplete,
  resizable = false,
  className,
  children,
  ...props
}: ComponentProps<typeof Drawer.Popup> & {
  open: boolean;
  onClose: () => void;
  onCloseComplete: () => void;
  resizable?: boolean;
}) {
  const [snapPoint, setSnapPoint] = useState<Drawer.Root.SnapPoint | null>(snapPoints[0]);
  // leave room for choices below the header on short screens and in landscape
  const canCollapse = useSyncExternalStore(
    subscribeHeight,
    supportsCompactHeight,
    serverCompactHeight,
  );
  const activeSnapPoint = canCollapse ? snapPoint : snapPoints[1];
  const availableSnapPoints = canCollapse ? snapPoints : expandedSnapPoints;
  return (
    <Drawer.Root
      open={open}
      swipeDirection="down"
      snapPoints={resizable ? availableSnapPoints : undefined}
      snapPoint={resizable ? activeSnapPoint : undefined}
      onSnapPointChange={setSnapPoint}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      onOpenChangeComplete={(open) => {
        if (!open) onCloseComplete();
      }}
    >
      <Drawer.VirtualKeyboardProvider>
        <Drawer.Portal>
          <Drawer.Backdrop className={cn("bg-overlay fixed inset-0 z-[100]", classes.backdrop)} />
          <Drawer.Viewport className="fixed inset-0 z-[100] flex items-end pb-[var(--drawer-keyboard-inset,0px)]">
            <Drawer.Popup
              {...props}
              onFocusCapture={(event) => {
                props.onFocusCapture?.(event);
                if (resizable && event.target instanceof HTMLInputElement)
                  setSnapPoint(snapPoints[1]);
              }}
              className={cn(classes.popup, resizable && classes.resizable, className)}
            >
              <div className="relative flex min-h-10 shrink-0 touch-none items-center justify-center select-none">
                <div aria-hidden="true" className="bg-muted-foreground/40 h-1 w-9 rounded-full" />
              </div>
              {children}
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.VirtualKeyboardProvider>
    </Drawer.Root>
  );
}
