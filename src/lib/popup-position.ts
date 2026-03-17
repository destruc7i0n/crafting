export type Placement = "top" | "right" | "bottom" | "left";

const GAP = 8;
const VIEWPORT_PADDING = 8;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const getPosition = (side: Placement, rect: DOMRect, popupW: number, popupH: number) => {
  switch (side) {
    case "top":
      return { top: rect.top - popupH - GAP, left: rect.left + rect.width / 2 - popupW / 2 };
    case "bottom":
      return { top: rect.bottom + GAP, left: rect.left + rect.width / 2 - popupW / 2 };
    case "left":
      return { top: rect.top + rect.height / 2 - popupH / 2, left: rect.left - popupW - GAP };
    case "right":
    default:
      return { top: rect.top + rect.height / 2 - popupH / 2, left: rect.right + GAP };
  }
};

const getFallbackPlacement = (side: Placement): Placement => {
  switch (side) {
    case "top":
      return "bottom";
    case "bottom":
      return "top";
    case "left":
      return "right";
    case "right":
    default:
      return "left";
  }
};

export const computePosition = (
  placement: Placement,
  triggerRect: DOMRect,
  popupWidth: number,
  popupHeight: number,
): { top: number; left: number } => {
  let pos = getPosition(placement, triggerRect, popupWidth, popupHeight);

  if (placement === "top" && pos.top < VIEWPORT_PADDING) {
    pos = getPosition(getFallbackPlacement(placement), triggerRect, popupWidth, popupHeight);
  }
  if (placement === "bottom" && pos.top + popupHeight > window.innerHeight - VIEWPORT_PADDING) {
    pos = getPosition(getFallbackPlacement(placement), triggerRect, popupWidth, popupHeight);
  }
  if (placement === "left" && pos.left < VIEWPORT_PADDING) {
    pos = getPosition(getFallbackPlacement(placement), triggerRect, popupWidth, popupHeight);
  }
  if (placement === "right" && pos.left + popupWidth > window.innerWidth - VIEWPORT_PADDING) {
    pos = getPosition(getFallbackPlacement(placement), triggerRect, popupWidth, popupHeight);
  }

  return {
    top: clamp(pos.top, VIEWPORT_PADDING, Math.max(VIEWPORT_PADDING, window.innerHeight - popupHeight - VIEWPORT_PADDING)),
    left: clamp(pos.left, VIEWPORT_PADDING, Math.max(VIEWPORT_PADDING, window.innerWidth - popupWidth - VIEWPORT_PADDING)),
  };
};
