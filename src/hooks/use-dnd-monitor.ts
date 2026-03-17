import { useEffect } from "react";

import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import { cloneItem } from "@/data/models/item/utilities";
import { useIsTouchDevice } from "@/hooks/use-is-touch-device";
import { isDropTargetData, isItemDraggableData, isItemPreviewDropTargetData } from "@/lib/dnd";
import { canRecipeSlotAcceptIngredient } from "@/lib/recipe-slots";
import { useRecipeStore } from "@/stores/recipe";

export const useDndMonitor = () => {
  const isTouchDevice = useIsTouchDevice();

  useEffect(() => {
    if (isTouchDevice) return;

    return monitorForElements({
      canMonitor: ({ source }) => {
        return isItemDraggableData(source.data);
      },
      onDrop: ({ source, location }) => {
        // #region agent log
        console.log('[DEBUG][onDrop] fired', { sourceData: source.data, dropTargets: location.current.dropTargets.map(d => d.data) });
        // #endregion
        if (!isItemDraggableData(source.data)) {
          // #region agent log
          console.log('[DEBUG][onDrop] source not ItemDraggableData, returning');
          // #endregion
          return;
        }

        const sourceDropTarget = location.initial.dropTargets[0];
        if (sourceDropTarget && isItemPreviewDropTargetData(sourceDropTarget.data)) {
          useRecipeStore.getState().setRecipeSlot(sourceDropTarget.data.slot, undefined);
        }

        const destination = location.current.dropTargets[0];
        if (!destination) {
          // #region agent log
          console.log('[DEBUG][onDrop] no destination drop target');
          // #endregion
          return;
        }

        if (!isDropTargetData(destination.data)) {
          // #region agent log
          console.log('[DEBUG][onDrop] destination not DropTargetData', { destData: destination.data });
          // #endregion
          return;
        }

        const dropTargetData = destination.data;
        const { item } = source.data;

        if (dropTargetData.type === "preview") {
          if (!canRecipeSlotAcceptIngredient(dropTargetData.slot, item)) {
            // #region agent log
            console.log('[DEBUG][onDrop] canRecipeSlotAcceptIngredient rejected', { slot: dropTargetData.slot, itemType: item.type });
            // #endregion
            return;
          }

          // #region agent log
          console.log('[DEBUG][onDrop] calling setRecipeSlot', { slot: dropTargetData.slot, itemId: item.id, itemType: item.type });
          // #endregion
          useRecipeStore.getState().setRecipeSlot(dropTargetData.slot, cloneItem(item));
        }
      },
    });
  }, [isTouchDevice]);
};
