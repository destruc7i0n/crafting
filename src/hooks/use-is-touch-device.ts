import { useSyncExternalStore } from "react";

let state = typeof window !== "undefined" ? window.matchMedia("(pointer: coarse)").matches : false;

const listeners = new Set<() => void>();

const emitChange = () => {
  for (const listener of listeners) {
    listener();
  }
};

let unsubscribePointerDown: (() => void) | undefined;

const handlePointerDown = (event: PointerEvent) => {
  const isTouch = event.pointerType === "touch" || event.pointerType === "pen";
  if (isTouch === state) return;

  state = isTouch;

  emitChange();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);

  if (typeof window !== "undefined" && !unsubscribePointerDown) {
    window.addEventListener("pointerdown", handlePointerDown);
    unsubscribePointerDown = () => window.removeEventListener("pointerdown", handlePointerDown);
  }

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      unsubscribePointerDown?.();
      unsubscribePointerDown = undefined;
    }
  };
};

const getSnapshot = () => state;

export const useIsTouchDevice = () => useSyncExternalStore(subscribe, getSnapshot, () => false);
