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
      if (rawSlotValue) {
        if (selectedIngredient.replaceTarget === slot) {
          // 2nd tap: confirm replace
          if (!canRecipeSlotAcceptIngredient(slot, selectedIngredient.item)) return;
          setRecipeSlot(slot, cloneItem(selectedIngredient.item));
          setSelectedIngredient({ item: selectedIngredient.item }); // clear replaceTarget
        } else {
          // 1st tap: mark pending
          setSelectedIngredient({ item: selectedIngredient.item, replaceTarget: slot });
        }
      } else {
        // empty slot: place ingredient
        if (!canRecipeSlotAcceptIngredient(slot, selectedIngredient.item)) return;
        setRecipeSlot(slot, cloneItem(selectedIngredient.item));
        setSelectedIngredient({ item: selectedIngredient.item }); // clear replaceTarget
      }
      return;
    }

    if (selectedPreview) {
      if (rawSlotValue) {
        if (selectedPreview.replaceTarget === slot) {
          // 2nd tap: confirm move
          if (!canRecipeSlotAcceptIngredient(slot, selectedPreview.item)) return;
          setRecipeSlot(slot, cloneItem(selectedPreview.item));
          setRecipeSlot(selectedPreview.slot, undefined);
          setSelectedIngredient(undefined); // clears all
        } else {
          // 1st tap on occupied slot: mark pending (also clears any previous replaceTarget)
          setSelectedPreview({
            item: selectedPreview.item,
            slot: selectedPreview.slot,
            replaceTarget: slot,
          });
        }
      } else {
        // empty slot: move immediately, no confirmation needed
        if (!canRecipeSlotAcceptIngredient(slot, selectedPreview.item)) return;
        setRecipeSlot(slot, cloneItem(selectedPreview.item));
        setRecipeSlot(selectedPreview.slot, undefined);
        setSelectedIngredient(undefined); // clears all
      }
      return;
    }

    if (rawSlotValue) {
      setSelectedPreview({ item: rawSlotValue, slot });
    }
  };
};
