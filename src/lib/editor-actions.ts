import { getCustomTagIdentifier } from "@/lib/tags";
import { RecipeSlot } from "@/recipes/slots";
import { useCustomItemStore } from "@/stores/custom-item";
import { useRecipeStore } from "@/stores/recipe";
import { useTagStore } from "@/stores/tag";
import { useUIStore } from "@/stores/ui";

export const deleteCustomItemAndClearRecipeRefs = (uid: string) => {
  const item = useCustomItemStore.getState().customItems.find((current) => current.uid === uid);

  // tags keep pointing at the id: it is still a valid authored id and still exports
  if (item) {
    useTagStore.getState().materializeCustomRefs("custom_item", uid, item.id);
  }

  useCustomItemStore.getState().deleteCustomItem(uid);
  useRecipeStore
    .getState()
    .removeMatchingSlotValues((value) => value.kind === "custom_item" && value.uid === uid);
};

export const deleteTagAndClearRecipeRefs = (uid: string) => {
  const tag = useTagStore.getState().tags.find((currentTag) => currentTag.uid === uid);

  // other tags keep pointing at the id, as they did before refs were uid-based
  if (tag) {
    useTagStore.getState().materializeCustomRefs("custom_tag", uid, getCustomTagIdentifier(tag));
  }

  useTagStore.getState().removeTag(uid);
  useRecipeStore
    .getState()
    .removeMatchingSlotValues((value) => value.kind === "custom_tag" && value.uid === uid);
};

export const clearSelectedRecipeAndSlotSelection = () => {
  useRecipeStore.getState().clearSelectedRecipeSlots();
  useUIStore.getState().clearInteractionState();
};

export const selectRecipeAndClearInteraction = (id: string) => {
  const recipeState = useRecipeStore.getState();
  const shouldClearInteraction = id !== recipeState.selectedRecipeId;

  if (shouldClearInteraction) {
    useUIStore.getState().clearInteractionState();
  }

  recipeState.selectRecipe(id);
};

export const createRecipeAndClearInteraction = () => {
  const recipeState = useRecipeStore.getState();

  useUIStore.getState().clearInteractionState();
  recipeState.createRecipe();
};

export const cloneRecipeAndClearInteraction = (id: string) => {
  const recipeState = useRecipeStore.getState();

  useUIStore.getState().clearInteractionState();
  recipeState.cloneRecipe(id);
};

export const deleteRecipeAndClearInteraction = (id: string) => {
  const recipeState = useRecipeStore.getState();
  const shouldClearInteraction =
    recipeState.selectedRecipeId === id && recipeState.recipes.length > 1;

  if (shouldClearInteraction) {
    useUIStore.getState().clearInteractionState();
  }

  recipeState.deleteRecipe(id);
};

export const clearRecipeSlotAndSelection = (slot: RecipeSlot) => {
  useRecipeStore.getState().setRecipeSlot(slot, undefined);
  useUIStore.getState().clearInteractionState();
};
