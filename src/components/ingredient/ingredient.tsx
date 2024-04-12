import { useEffect, useRef, useState } from "react";

import ReactDOM from "react-dom";

import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { centerUnderPointer } from "@atlaskit/pragmatic-drag-and-drop/element/center-under-pointer";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { preventUnhandled } from "@atlaskit/pragmatic-drag-and-drop/prevent-unhandled";
import invariant from "tiny-invariant";

import { Item } from "@/data/models/types";
import { useResourceTexture } from "@/hooks/use-resource-texture";

import { IngredientPreview } from "./ingredient-preview";
import { Tooltip } from "./tooltip/tooltip";

type IngredientProps = {
  item: Item;
  container: "preview" | "ingredients";
};

export const Ingredient = ({ item, container }: IngredientProps) => {
  const ref = useRef<HTMLImageElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const texture = useResourceTexture(item);

  const [tooltipOffset, setTooltipOffset] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    const el = ref.current;

    const onMove = (e: MouseEvent) => {
      requestAnimationFrame(() => {
        if (el) {
          const x = e.offsetX;
          const y = e.offsetY;

          setTooltipOffset([x, y]);
        }
      });
    };

    el?.addEventListener("mousemove", onMove);
    return () => el?.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    const el = ref.current;
    invariant(el);

    return draggable({
      element: el,
      getInitialData: () => ({ type: "item", item, container }),
      getInitialDataForExternal: () => ({ "text/plain": item.id.raw }),
      onDragStart: () => {
        if (container === "preview") {
          // we can drop out from the preview container
          preventUnhandled.start();
        }
        setDragging(true);
      },
      onDrop: () => setDragging(false),
      onGenerateDragPreview: ({ nativeSetDragImage }) => {
        // use a custom drag preview to center the preview under the pointer
        setCustomNativeDragPreview({
          getOffset: centerUnderPointer,
          render({ container }) {
            ReactDOM.render(<IngredientPreview texture={texture} />, container);
            return () => ReactDOM.unmountComponentAtNode(container);
          },
          nativeSetDragImage,
        });
      },
    });
  }, [texture, item, container]);

  return (
    <div className="ingredient relative">
      <IngredientPreview
        alt={item.displayName}
        texture={texture}
        ref={ref}
        style={{
          opacity: dragging ? 0.5 : 1,
        }}
      />

      {!dragging && (
        <Tooltip
          title={item.displayName}
          description={item.id.raw}
          style={{
            top: tooltipOffset[1],
            left: tooltipOffset[0],
          }}
        />
      )}
    </div>
  );
};
