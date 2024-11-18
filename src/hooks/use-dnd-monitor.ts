import { useEffect } from "react";

import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import { cloneItem } from "@/data/models/item/utilities";
import {
  DropTargetData,
  ItemDraggableData,
  ItemPreviewDropTargetData,
} from "@/lib/dnd";
import { useRecipeStore } from "@/stores/recipe";
import { useTagStore } from "@/stores/tag";

export const useDndMonitor = () => {
  const setRecipeSlot = useRecipeStore((state) => state.setRecipeSlot);
  const addValueToTag = useTagStore((state) => state.addValueToTag);

  useEffect(() => {
    return monitorForElements({
      canMonitor: ({ source }) => {
        return (source.data as ItemDraggableData).type === "item";
      },
      onDrop: ({ source, location }) => {
        // if from a slot, remove the item from the previous slot
        const sourceDropTarget = location.initial.dropTargets[0];
        if (sourceDropTarget) {
          const { type } = sourceDropTarget.data as DropTargetData;

          // dragging from a preview slot, remove the item from the slot
          if (type === "preview") {
            const { slot } = sourceDropTarget.data as ItemPreviewDropTargetData;
            if (slot) {
              setRecipeSlot(slot, undefined);
            }
          }
        }

        // check if we are dropping into a slot
        const destination = location.current.dropTargets[0];
        if (!destination) {
          // if dropped outside of any drop targets
          return;
        }

        const dropTargetData = destination.data as DropTargetData;
        const { item } = source.data as ItemDraggableData;

        if (dropTargetData.type === "preview") {
          setRecipeSlot(dropTargetData.slot, cloneItem(item));
        } else if (dropTargetData.type === "tag-creation") {
          addValueToTag({ type: "item", id: item.id });
        }
      },
    });
  }, [setRecipeSlot, addValueToTag]);
};
