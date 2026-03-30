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

    const { selection, setSelection } = useUIStore.getState();

    // tap same selected preview slot → deselect
    if (selection?.type === "preview" && selection.slot === slot) {
      setSelection(undefined);
      return;
    }

    if (selection?.type === "ingredient") {
      if (!canRecipeSlotAcceptIngredient(slot, selection.item)) return;
      setRecipeSlot(slot, cloneItem(selection.item));
      setSelection({ type: "ingredient", item: selection.item });
      return;
    }

    if (selection?.type === "preview") {
      if (!canRecipeSlotAcceptIngredient(slot, selection.item)) return;
      if (rawSlotValue) {
        // swap: destination gets selected item, source gets displaced item
        setRecipeSlot(slot, cloneItem(selection.item));
        setRecipeSlot(selection.slot, cloneItem(rawSlotValue));
      } else {
        // empty slot: move
        setRecipeSlot(slot, cloneItem(selection.item));
        setRecipeSlot(selection.slot, undefined);
      }
      setSelection({ type: "preview", item: selection.item, slot });
      return;
    }

    if (rawSlotValue) {
      setSelection({ type: "preview", item: rawSlotValue, slot });
    }
  };
};
