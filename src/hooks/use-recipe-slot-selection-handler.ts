import { RecipeSlot } from "@/data/types";
import { useIsTouchDevice } from "@/hooks/use-is-touch-device";
import { canRecipeSlotAcceptIngredientItem, canRecipeSlotAcceptSlotValue } from "@/recipes/slots";
import { useRecipeStore } from "@/stores/recipe";
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

  return (_: React.MouseEvent) => {
    if (!isTouchDevice) return;

    const { selection, setSelection } = useUIStore.getState();

    // tap same selected recipe slot -> deselect
    if (selection?.type === "slot" && selection.slot === slot) {
      setSelection(undefined);
      return;
    }

    if (selection?.type === "ingredient") {
      if (!canRecipeSlotAcceptIngredientItem(slot, selection.item)) return;
      setRecipeSlotFromIngredient(slot, selection.item);
      setSelection({ type: "ingredient", item: selection.item });
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
      setSelection({ type: "slot", value: cloneRecipeSlotValue(selection.value), slot });
      return;
    }

    if (rawSlotValue) {
      setSelection({ type: "slot", value: cloneRecipeSlotValue(rawSlotValue), slot });
    }
  };
};
