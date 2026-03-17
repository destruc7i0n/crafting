import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

let uidCounter = 0;

export const generateUid = (prefix = "id"): string =>
  globalThis.crypto?.randomUUID?.() ??
  `${prefix}-${(++uidCounter).toString(36)}-${Math.random().toString(36).slice(2)}`;
