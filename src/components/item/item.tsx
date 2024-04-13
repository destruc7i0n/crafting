import { useEffect, useRef, useState } from "react";

import ReactDOM from "react-dom";

import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { centerUnderPointer } from "@atlaskit/pragmatic-drag-and-drop/element/center-under-pointer";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { preventUnhandled } from "@atlaskit/pragmatic-drag-and-drop/prevent-unhandled";
import invariant from "tiny-invariant";

import { Item as ItemType } from "@/data/models/types";
import { defaultTextures } from "@/data/textures";

import { ItemPreview } from "./item-preview";
import { Tooltip } from "../tooltip/tooltip";

type IngredientProps = {
  item: ItemType;
  container: "preview" | "ingredients";
};

export const Item = ({ item, container }: IngredientProps) => {
  const ref = useRef<HTMLImageElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const texture = defaultTextures[item._version]?.[item.id.raw];

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
            ReactDOM.render(<ItemPreview texture={texture} />, container);
            return () => ReactDOM.unmountComponentAtNode(container);
          },
          nativeSetDragImage,
        });
      },
    });
  }, [texture, item, container]);

  return (
    <Tooltip
      title={item.displayName}
      description={item.id.raw}
      visible={!dragging}
    >
      <ItemPreview
        alt={item.displayName}
        texture={texture}
        ref={ref}
        style={{
          opacity: dragging ? 0.5 : 1,
        }}
      />
    </Tooltip>
  );
};
