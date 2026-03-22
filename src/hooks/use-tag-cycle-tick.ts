import { useCallback, useRef, useSyncExternalStore } from "react";

let tick = 0;
let intervalId: number | undefined;
const listeners = new Set<() => void>();

const emit = () => {
  for (const listener of listeners) {
    listener();
  }
};

const start = () => {
  if (intervalId !== undefined) {
    return;
  }

  intervalId = window.setInterval(() => {
    tick += 1;
    emit();
  }, 1000);
};

const stop = () => {
  if (intervalId === undefined || listeners.size > 0) {
    return;
  }

  window.clearInterval(intervalId);
  intervalId = undefined;
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  start();

  return () => {
    listeners.delete(listener);
    stop();
  };
};

const noopSubscribe = () => () => {};

export const useTagCycleIndex = (itemCount: number) => {
  const countRef = useRef(itemCount);
  countRef.current = itemCount;

  const getIndex = useCallback(() => (countRef.current > 1 ? tick % countRef.current : 0), []);

  return useSyncExternalStore(itemCount > 1 ? subscribe : noopSubscribe, getIndex, getIndex);
};
