import { useEffect } from "react";

import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import { cloneItem } from "@/data/models/item/utilities";
import { canRecipeSlotAcceptIngredient } from "@/lib/recipe-slots";
import { isDropTargetData, isItemDraggableData, isItemPreviewDropTargetData } from "@/lib/dnd";
import { useRecipeStore } from "@/stores/recipe";
import { useIsTouchDevice } from "@/hooks/use-is-touch-device";

export const useDndMonitor = () => {
  const isTouchDevice = useIsTouchDevice();

  useEffect(() => {
    if (isTouchDevice) return;

    return monitorForElements({
      canMonitor: ({ source }) => {
        return isItemDraggableData(source.data);
      },
      onDrop: ({ source, location }) => {
        if (!isItemDraggableData(source.data)) {
          return;
        }

        const sourceDropTarget = location.initial.dropTargets[0];
        if (sourceDropTarget && isItemPreviewDropTargetData(sourceDropTarget.data)) {
          useRecipeStore.getState().setRecipeSlot(sourceDropTarget.data.slot, undefined);
        }

        const destination = location.current.dropTargets[0];
        if (!destination) {
          return;
        }

        if (!isDropTargetData(destination.data)) {
          return;
        }

        const dropTargetData = destination.data;
        const { item } = source.data;

        if (dropTargetData.type === "preview") {
          if (!canRecipeSlotAcceptIngredient(dropTargetData.slot, item)) {
            return;
          }

          useRecipeStore.getState().setRecipeSlot(dropTargetData.slot, cloneItem(item));
        }
      },
    });
  }, [isTouchDevice]);
};
