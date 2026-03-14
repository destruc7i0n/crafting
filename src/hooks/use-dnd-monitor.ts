import { useEffect } from "react";

import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import { cloneItem } from "@/data/models/item/utilities";
import { isDropTargetData, isItemDraggableData, isItemPreviewDropTargetData } from "@/lib/dnd";
import { useRecipeStore } from "@/stores/recipe";
import { useTagStore } from "@/stores/tag";

export const useDndMonitor = () => {
  const setRecipeSlot = useRecipeStore((state) => state.setRecipeSlot);
  const addValueToTag = useTagStore((state) => state.addValueToTag);

  useEffect(() => {
    return monitorForElements({
      canMonitor: ({ source }) => {
        return isItemDraggableData(source.data);
      },
      onDrop: ({ source, location }) => {
        if (!isItemDraggableData(source.data)) {
          return;
        }

        // if from a slot, remove the item from the previous slot
        const sourceDropTarget = location.initial.dropTargets[0];
        if (sourceDropTarget && isItemPreviewDropTargetData(sourceDropTarget.data)) {
          setRecipeSlot(sourceDropTarget.data.slot, undefined);
        }

        // check if we are dropping into a slot
        const destination = location.current.dropTargets[0];
        if (!destination) {
          // if dropped outside of any drop targets
          return;
        }

        if (!isDropTargetData(destination.data)) {
          return;
        }

        const dropTargetData = destination.data;
        const { item } = source.data;

        if (dropTargetData.type === "preview") {
          setRecipeSlot(dropTargetData.slot, cloneItem(item));
        } else if (dropTargetData.type === "tag-creation") {
          addValueToTag({ type: "item", id: item.id });
        }
      },
    });
  }, [setRecipeSlot, addValueToTag]);
};
