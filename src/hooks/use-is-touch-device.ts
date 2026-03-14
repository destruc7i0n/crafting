import { useSyncExternalStore } from "react";

const mediaQuery = typeof window !== "undefined" ? window.matchMedia("(pointer: coarse)") : null;

const listeners = new Set<() => void>();

const emitChange = () => {
  for (const listener of listeners) {
    listener();
  }
};

let unsubscribeMediaQuery: (() => void) | undefined;

const subscribe = (listener: () => void) => {
  listeners.add(listener);

  if (mediaQuery && !unsubscribeMediaQuery) {
    mediaQuery.addEventListener("change", emitChange);
    unsubscribeMediaQuery = () => mediaQuery.removeEventListener("change", emitChange);
  }

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      unsubscribeMediaQuery?.();
      unsubscribeMediaQuery = undefined;
    }
  };
};

const getSnapshot = () => mediaQuery?.matches ?? false;

export const useIsTouchDevice = () => useSyncExternalStore(subscribe, getSnapshot, () => false);
