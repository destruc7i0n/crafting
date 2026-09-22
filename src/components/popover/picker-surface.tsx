import type { ReactNode, RefObject } from "react";

import { Combobox } from "@base-ui/react/combobox";
import { Popover } from "@base-ui/react/popover";

import { PickerDrawer } from "@/components/dialog/picker-drawer";
import { cn } from "@/lib/utils";

import { popoverSurfaceClassName } from "./popover";

// shared positioning and focus behavior for visual pickers
export function PickerSurface({
  anchor,
  mobile,
  searchable,
  onClose,
  initialFocus,
  id,
  labelledBy,
  children,
}: {
  anchor: HTMLElement | null;
  mobile: boolean;
  searchable: boolean;
  onClose: () => void;
  initialFocus: boolean | RefObject<HTMLElement | null>;
  id: string;
  labelledBy: string;
  children: ReactNode;
}) {
  const popupProps = {
    id,
    "aria-labelledby": labelledBy,
    initialFocus,
    finalFocus: () => anchor,
    className: cn(
      popoverSurfaceClassName,
      "flex min-h-0 flex-col overflow-hidden",
      mobile
        ? "max-h-[min(85dvh,calc(100dvh-var(--drawer-keyboard-inset,0px)))] w-full rounded-t-xl rounded-b-none pb-[env(safe-area-inset-bottom)] shadow-xl"
        : "max-h-[min(360px,var(--available-height))] w-[var(--anchor-width)] max-w-[calc(100vw-24px)] pt-2",
    ),
    children,
  };
  const onOpenChange = (open: boolean) => {
    if (!open) onClose();
  };
  if (mobile) return <PickerDrawer {...popupProps} onClose={onClose} />;
  const positionerProps = {
    anchor,
    side: "bottom" as const,
    align: "start" as const,
    sideOffset: 4,
    collisionPadding: 12,
    className: "z-[100]",
  };
  if (searchable)
    return (
      <Combobox.Portal>
        <Combobox.Positioner {...positionerProps}>
          <Combobox.Popup {...popupProps} />
        </Combobox.Positioner>
      </Combobox.Portal>
    );
  return (
    <Popover.Root open onOpenChange={onOpenChange}>
      <Popover.Portal>
        <Popover.Positioner {...positionerProps}>
          <Popover.Popup {...popupProps} />
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
