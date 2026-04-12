import { RecipeSlot } from "@/recipes/slots";
import { useCustomItemStore } from "@/stores/custom-item";
import { useRecipeStore } from "@/stores/recipe";
import { useTagStore } from "@/stores/tag";
import { useUIStore } from "@/stores/ui";

export const deleteCustomItemAndClearRecipeRefs = (uid: string) => {
  useCustomItemStore.getState().deleteCustomItem(uid);
  useRecipeStore
    .getState()
    .removeMatchingSlotValues((value) => value.kind === "custom_item" && value.uid === uid);
};

export const deleteTagAndClearRecipeRefs = (uid: string) => {
  useTagStore.getState().removeTag(uid);
  useRecipeStore
    .getState()
    .removeMatchingSlotValues((value) => value.kind === "custom_tag" && value.uid === uid);
};

export const clearSelectedRecipeAndSlotSelection = () => {
  useRecipeStore.getState().clearSelectedRecipeSlots();

  if (useUIStore.getState().selection?.type === "slot") {
    useUIStore.getState().setSelection(undefined);
  }
};

export const clearRecipeSlotAndSelection = (slot: RecipeSlot) => {
  useRecipeStore.getState().setRecipeSlot(slot, undefined);
  useUIStore.getState().setSelection(undefined);
};
