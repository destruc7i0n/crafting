import { useEffect } from "react";

import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import { Item } from "@/data/models/types";
import { useAppDispatch } from "@/store/hooks";
import { RecipeSlot, setSlot } from "@/store/slices/recipeSlice";

export const usePreviewDndHandler = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    return monitorForElements({
      canMonitor: ({ source }) => {
        return source.data.type === "item";
      },
      onDrop: ({ source, location }) => {
        // if from a slot, remove the item from the previous slot
        const sourceDropTarget = location.initial.dropTargets[0];
        if (sourceDropTarget) {
          const { slot } = sourceDropTarget.data as { slot?: RecipeSlot };
          if (slot) {
            dispatch(setSlot({ slot, item: undefined }));
          }
        }

        // check if we are dropping into a slot
        const destination = location.current.dropTargets[0];
        if (!destination) {
          // if dropped outside of any drop targets
          return;
        }

        const { slot } = destination.data as { slot?: RecipeSlot };
        const { item } = source.data as { item: Item };

        if (slot) {
          dispatch(setSlot({ slot, item }));
        }
      },
    });
  }, [dispatch]);
};
