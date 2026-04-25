import { useEffect } from "react";

import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import { IngredientItem } from "@/data/models/types";
import { useIsTouchDevice } from "@/hooks/use-is-touch-device";
import { trackRecipeStartedIfNeeded } from "@/lib/analytics";
import { ItemDraggableData, isItemDraggableData, isRecipeSlotDropTargetData } from "@/lib/dnd";
import { RecipeSlot } from "@/recipes/slots";
import {
  canRecipeSlotAcceptIngredientItem,
  canRecipeSlotAcceptSlotValue,
} from "@/recipes/slots/utils";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe } from "@/stores/recipe/selectors";
import { cloneRecipeSlotValue } from "@/stores/recipe/slot-value";
import { RecipeSlotValue } from "@/stores/recipe/types";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";

type ApplyRecipeDragDropArgs = {
  sourceData: ItemDraggableData;
  sourceSlot?: RecipeSlot;
  destinationData?: unknown;
  setRecipeSlot: (slot: RecipeSlot, value?: RecipeSlotValue) => void;
  setRecipeSlotFromIngredient: (slot: RecipeSlot, item: IngredientItem) => void;
};

export const applyRecipeDragDrop = ({
  sourceData,
  sourceSlot,
  destinationData,
  setRecipeSlot,
  setRecipeSlotFromIngredient,
}: ApplyRecipeDragDropArgs) => {
  if (!destinationData || !isRecipeSlotDropTargetData(destinationData)) {
    if (sourceData.type === "recipe-slot" && sourceSlot) {
      setRecipeSlot(sourceSlot, undefined);
    }
    return;
  }

  const { slot } = destinationData;

  if (sourceData.type === "palette-item") {
    if (!canRecipeSlotAcceptIngredientItem(slot, sourceData.item)) {
      return;
    }

    setRecipeSlotFromIngredient(slot, sourceData.item);
    return;
  }

  if (sourceSlot === slot) {
    return;
  }

  const sourceValue = cloneRecipeSlotValue(sourceData.value);
  if (!canRecipeSlotAcceptSlotValue(slot, sourceValue)) {
    return;
  }

  setRecipeSlot(slot, sourceValue);
  if (sourceSlot) {
    setRecipeSlot(sourceSlot, undefined);
  }
};

export const useDndMonitor = () => {
  const isTouchDevice = useIsTouchDevice();
  const minecraftVersion = useSettingsStore(selectMinecraftVersion);

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
        const sourceSlot =
          sourceDropTarget && isRecipeSlotDropTargetData(sourceDropTarget.data)
            ? sourceDropTarget.data.slot
            : undefined;
        const destination = location.current.dropTargets[0];
        const recipeStore = useRecipeStore.getState();
        const beforeRecipe = selectCurrentRecipe(recipeStore);

        applyRecipeDragDrop({
          sourceData: source.data,
          sourceSlot,
          destinationData: destination?.data,
          setRecipeSlot: recipeStore.setRecipeSlot,
          setRecipeSlotFromIngredient: recipeStore.setRecipeSlotFromIngredient,
        });

        trackRecipeStartedIfNeeded({
          beforeRecipe,
          afterRecipe: selectCurrentRecipe(useRecipeStore.getState()),
          minecraftVersion,
          inputMethod: "drag",
        });
      },
    });
  }, [isTouchDevice, minecraftVersion]);
};
