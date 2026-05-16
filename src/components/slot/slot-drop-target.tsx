import { useEffect, useEffectEvent, useRef, useState } from "react";

import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import { isItemDraggableData } from "@/lib/dnd";

import { Slot, SlotProps } from "./slot";

type SlotDropTargetProps<T extends Record<string, unknown>> = {
  data: T;
  children?: React.ReactNode;
  canDrop?: ({ source }: { source: { data: unknown } }) => boolean;
} & SlotProps;

export const SlotDropTarget = <T extends Record<string, unknown>>({
  data,
  children,
  canDrop,
  disabled: disabledProp,
  ...props
}: SlotDropTargetProps<T>) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const [isInvalidTarget, setIsInvalidTarget] = useState(false);

  const getDropData = useEffectEvent(() => data);
  const canDropItem = useEffectEvent(({ source }: { source: { data: unknown } }) => {
    return isItemDraggableData(source.data) && (canDrop?.({ source }) ?? true);
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    return combine(
      dropTargetForElements({
        element: el,
        canDrop: canDropItem,
        getData: getDropData,
        onDragEnter: () => setIsDraggedOver(true),
        onDragLeave: () => setIsDraggedOver(false),
        onDrop: () => {
          setIsDraggedOver(false);
          setIsInvalidTarget(false);
        },
      }),
      monitorForElements({
        onDragStart: ({ source }) => {
          setIsInvalidTarget(!canDropItem({ source }));
        },
        onDrop: () => setIsInvalidTarget(false),
      }),
    );
  }, []); // ensure listeners are created only once

  return (
    <Slot ref={ref} active={isDraggedOver} disabled={isInvalidTarget || disabledProp} {...props}>
      {children}
    </Slot>
  );
};
