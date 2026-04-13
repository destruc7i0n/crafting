import { useIsTouchDevice } from "@/hooks/use-is-touch-device";
import { RecipeSlot } from "@/recipes/slots";
import {
  canRecipeSlotAcceptIngredientItem,
  canRecipeSlotAcceptSlotValue,
} from "@/recipes/slots/utils";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipeSlot } from "@/stores/recipe/selectors";
import { cloneRecipeSlotValue } from "@/stores/recipe/slot-value";
import { RecipeSlotValue } from "@/stores/recipe/types";
import { useUIStore } from "@/stores/ui";

export const useRecipeSlotSelectionHandler = (
  slot: RecipeSlot,
  rawSlotValue: RecipeSlotValue | undefined,
) => {
  const isTouchDevice = useIsTouchDevice();
  const setRecipeSlot = useRecipeStore((state) => state.setRecipeSlot);
  const setRecipeSlotFromIngredient = useRecipeStore((state) => state.setRecipeSlotFromIngredient);

  return () => {
    if (!isTouchDevice) return;

    const { selection, lastPlacedSlot, selectIngredient, selectSlot, clearInteractionState } =
      useUIStore.getState();

    // tap same selected recipe slot -> deselect
    if (selection?.type === "slot" && selection.slot === slot) {
      clearInteractionState();
      return;
    }

    if (selection?.type === "ingredient") {
      if (!canRecipeSlotAcceptIngredientItem(slot, selection.item)) return;

      const currentSlotValue =
        lastPlacedSlot === slot
          ? selectCurrentRecipeSlot(slot)(useRecipeStore.getState())
          : undefined;

      if (currentSlotValue) {
        // tap same preview slot after placing -> select placed item
        selectSlot(slot, cloneRecipeSlotValue(currentSlotValue));
        return;
      }

      setRecipeSlotFromIngredient(slot, selection.item);
      selectIngredient(selection.item, {
        lastPlacedSlot: slot,
      });
      return;
    }

    if (selection?.type === "slot") {
      if (!canRecipeSlotAcceptSlotValue(slot, selection.value)) return;
      if (rawSlotValue) {
        // swap: destination gets selected item, source gets displaced item
        setRecipeSlot(slot, cloneRecipeSlotValue(selection.value));
        setRecipeSlot(selection.slot, cloneRecipeSlotValue(rawSlotValue));
      } else {
        // empty slot: move
        setRecipeSlot(slot, cloneRecipeSlotValue(selection.value));
        setRecipeSlot(selection.slot, undefined);
      }
      selectSlot(slot, cloneRecipeSlotValue(selection.value));
      return;
    }

    if (rawSlotValue) {
      selectSlot(slot, cloneRecipeSlotValue(rawSlotValue));
    }
  };
};
