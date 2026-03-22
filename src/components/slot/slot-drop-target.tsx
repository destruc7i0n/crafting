import { useEffect, useRef, useState } from "react";

import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  dropTargetForElements,
  monitorForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import invariant from "tiny-invariant";

import { useItemSelection } from "@/hooks/use-item-selection";
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

  // refs keep canDrop and data current without triggering listener recreation.
  const canDropRef = useRef(canDrop);
  canDropRef.current = canDrop;

  const dataRef = useRef(data);
  dataRef.current = data;

  const selection = useItemSelection();
  const isDisabledForSelection =
    selection !== undefined &&
    !(
      canDropRef.current?.({
        source: {
          data: {
            type: "item" as const,
            item: selection.item,
            container: selection.type,
          },
        },
      }) ?? true
    );

  useEffect(() => {
    const el = ref.current;
    invariant(el);

    return combine(
      dropTargetForElements({
        element: el,
        canDrop: ({ source }) =>
          isItemDraggableData(source.data) && (canDropRef.current?.({ source }) ?? true),
        getData: () => dataRef.current,
        onDragEnter: () => setIsDraggedOver(true),
        onDragLeave: () => setIsDraggedOver(false),
        onDrop: () => {
          setIsDraggedOver(false);
          setIsInvalidTarget(false);
        },
      }),
      monitorForElements({
        onDragStart: ({ source }) => {
          const canAccept =
            isItemDraggableData(source.data) && (canDropRef.current?.({ source }) ?? true);
          setIsInvalidTarget(!canAccept);
        },
        onDrop: () => setIsInvalidTarget(false),
      }),
    );
  }, []); // ensure listeners are created only once

  return (
    <Slot
      ref={ref}
      active={isDraggedOver}
      disabled={isInvalidTarget || isDisabledForSelection || disabledProp}
      {...props}
    >
      {children}
    </Slot>
  );
};
