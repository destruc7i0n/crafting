import { useEffect } from "react";

import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import { cloneItem } from "@/data/models/item/utilities";
import { Item } from "@/data/models/types";
import { RecipeSlot } from "@/data/types";
import { useRecipeStore } from "@/stores/recipe";

export const usePreviewDndHandler = () => {
  const setRecipeSlot = useRecipeStore((state) => state.setRecipeSlot);

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
            setRecipeSlot(slot, undefined);
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
          setRecipeSlot(slot, cloneItem(item));
        }
      },
    });
  }, [setRecipeSlot]);
};
