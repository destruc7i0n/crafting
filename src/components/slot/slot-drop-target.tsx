import { useEffect, useRef, useState } from "react";

import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import invariant from "tiny-invariant";

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
  ...props
}: SlotDropTargetProps<T>) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  const canDropRef = useRef(canDrop);
  canDropRef.current = canDrop;

  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    const el = ref.current;
    invariant(el);

    return dropTargetForElements({
      element: el,
      canDrop: ({ source }) =>
        isItemDraggableData(source.data) && (canDropRef.current?.({ source }) ?? true),
      getData: () => dataRef.current,
      onDragEnter: () => setIsDraggedOver(true),
      onDragLeave: () => setIsDraggedOver(false),
      onDrop: () => setIsDraggedOver(false),
    });
  }, []);

  return (
    <Slot ref={ref} hover={isDraggedOver} {...props}>
      {children}
    </Slot>
  );
};
