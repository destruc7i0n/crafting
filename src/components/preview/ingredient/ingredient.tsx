import { useEffect, useRef, useState } from "react";

import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { centerUnderPointer } from "@atlaskit/pragmatic-drag-and-drop/element/center-under-pointer";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { preventUnhandled } from "@atlaskit/pragmatic-drag-and-drop/prevent-unhandled";
import ReactDOM from "react-dom";
import invariant from "tiny-invariant";

import { Item } from "@/data/models/item/Item";

import { IngredientPreview } from "./ingredient-preview";

type IngredientProps = {
  item: Item;
  container: "preview" | "ingredients";
};

export const Ingredient = ({ item, container }: IngredientProps) => {
  const ref = useRef<HTMLImageElement | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const el = ref.current;
    invariant(el);

    return draggable({
      element: el,
      getInitialData: () => ({ type: "item", item, container }),
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
            ReactDOM.render(<IngredientPreview item={item} />, container);
            return function cleanup() {
              ReactDOM.unmountComponentAtNode(container);
            };
          },
          nativeSetDragImage,
        });
      },
    });
  }, [item, container]);

  return (
    <IngredientPreview
      item={item}
      ref={ref}
      style={{
        opacity: dragging ? 0.5 : 1,
      }}
    />
  );
};
