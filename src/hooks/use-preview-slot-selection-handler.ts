import { cloneItem } from "@/data/models/item/utilities";
import { IngredientItem } from "@/data/models/types";
import { RecipeSlot } from "@/data/types";
import { useIsTouchDevice } from "@/hooks/use-is-touch-device";
import { canRecipeSlotAcceptIngredient } from "@/lib/recipe-slots";
import { useRecipeStore } from "@/stores/recipe";
import { useUIStore } from "@/stores/ui";

export const usePreviewSlotSelectionHandler = (
  slot: RecipeSlot,
  rawSlotValue: IngredientItem | undefined,
) => {
  const isTouchDevice = useIsTouchDevice();
  const setRecipeSlot = useRecipeStore((state) => state.setRecipeSlot);

  return (_: React.MouseEvent) => {
    if (!isTouchDevice) return;

    const { selectedIngredient, selectedPreview, setSelectedIngredient, setSelectedPreview } =
      useUIStore.getState();

    // tap same selected preview slot → deselect
    if (selectedPreview?.slot === slot) {
      setSelectedIngredient(undefined); // clears all
      return;
    }

    if (selectedIngredient) {
      if (!canRecipeSlotAcceptIngredient(slot, selectedIngredient.item)) return;
      setRecipeSlot(slot, cloneItem(selectedIngredient.item));
      setSelectedIngredient({ item: selectedIngredient.item });
      return;
    }

    if (selectedPreview) {
      if (!canRecipeSlotAcceptIngredient(slot, selectedPreview.item)) return;
      if (rawSlotValue) {
        // swap: destination gets selected item, source gets displaced item
        setRecipeSlot(slot, cloneItem(selectedPreview.item));
        setRecipeSlot(selectedPreview.slot, cloneItem(rawSlotValue));
      } else {
        // empty slot: move
        setRecipeSlot(slot, cloneItem(selectedPreview.item));
        setRecipeSlot(selectedPreview.slot, undefined);
      }
      setSelectedPreview({ item: selectedPreview.item, slot });
      return;
    }

    if (rawSlotValue) {
      setSelectedPreview({ item: rawSlotValue, slot });
    }
  };
};
