import { useId, useRef, useState, useSyncExternalStore } from "react";

import { Drawer } from "@base-ui/react/drawer";

import { useUIStore } from "@/stores/ui";

import { ItemsList } from "./items-list";

import styles from "./items-panel.module.css";

const snapPoints = ["56px", 0.45, 0.75];
const mobileQuery = "(max-width: 767px)";
const subscribeViewport = (listener: () => void) => {
  const query = window.matchMedia(mobileQuery);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
};
const getMobileSnapshot = () => window.matchMedia(mobileQuery).matches;
const getServerSnapshot = () => false;

export function ItemsPanel() {
  const mobile = useSyncExternalStore(subscribeViewport, getMobileSnapshot, getServerSnapshot);
  return mobile ? (
    <MobileItemsDrawer />
  ) : (
    <div className={styles.body}>
      <ItemsList />
    </div>
  );
}

function MobileItemsDrawer() {
  const [snapPoint, setSnapPoint] = useState<Drawer.Root.SnapPoint>(snapPoints[1]);
  const [collapsing, setCollapsing] = useState(false);
  const handleRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const bodyId = useId();
  const collapsed = snapPoint === snapPoints[0];
  const snapIndex = snapPoints.indexOf(snapPoint);
  const resize = (next: Drawer.Root.SnapPoint | null) => {
    const point = next ?? snapPoints[0];
    setCollapsing(snapPoints.indexOf(point) < snapIndex);
    if (point === snapPoints[0]) {
      useUIStore.getState().clearInteractionState();
      if (bodyRef.current?.contains(document.activeElement)) handleRef.current?.focus();
    }
    setSnapPoint(point);
  };

  return (
    <>
      <div
        aria-hidden="true"
        className={styles.spacer}
        data-collapsing={collapsing || undefined}
        style={{ height: typeof snapPoint === "number" ? `${snapPoint * 100}dvh` : snapPoint }}
      />
      <Drawer.Root
        open
        modal={false}
        disablePointerDismissal
        snapPoints={snapPoints}
        snapPoint={snapPoint}
        onSnapPointChange={(next, details) => {
          // Keep a small handle available when a flick would otherwise dismiss the drawer.
          if (next === null) details.cancel();
          resize(next);
        }}
        onOpenChange={(open, details) => {
          if (!open) {
            details.cancel();
            resize(snapPoints[0]);
          }
        }}
      >
        <Drawer.VirtualKeyboardProvider>
          <Drawer.Portal>
            <Drawer.Viewport className={styles.viewport}>
              <Drawer.Popup className={styles.popup} initialFocus={false} finalFocus={false}>
                <Drawer.Title className="sr-only">Items & Tags</Drawer.Title>
                <button
                  ref={handleRef}
                  type="button"
                  aria-expanded={!collapsed}
                  aria-controls={bodyId}
                  className={styles.handle}
                  onClick={() => resize(collapsed ? snapPoints[1] : snapPoints[0])}
                  onKeyDown={(event) => {
                    let next = snapIndex;
                    if (event.key === "ArrowUp" || event.key === "ArrowRight") next++;
                    else if (event.key === "ArrowDown" || event.key === "ArrowLeft") next--;
                    else if (event.key === "Home") next = 0;
                    else if (event.key === "End") next = 2;
                    else return;
                    event.preventDefault();
                    resize(snapPoints[Math.max(0, Math.min(2, next))]);
                  }}
                >
                  <span aria-hidden="true" className={styles.grip} />
                  <span>Items & Tags</span>
                </button>
                <div
                  id={bodyId}
                  ref={bodyRef}
                  data-base-ui-swipe-ignore
                  inert={collapsed}
                  className={styles.body}
                  style={{ visibility: collapsed ? "hidden" : undefined }}
                >
                  <ItemsList />
                </div>
              </Drawer.Popup>
            </Drawer.Viewport>
          </Drawer.Portal>
        </Drawer.VirtualKeyboardProvider>
      </Drawer.Root>
    </>
  );
}
