import { MinecraftVersion } from "@/data/types";
import { trackMinecraftVersionChange } from "@/lib/analytics";
import { RecipeSlot } from "@/recipes/slots";
import { useCustomItemStore } from "@/stores/custom-item";
import { useRecipeStore } from "@/stores/recipe";
import { useSettingsStore } from "@/stores/settings";
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

export const isCrossPlatformVersionSwitch = (prev: MinecraftVersion, next: MinecraftVersion) =>
  (prev === MinecraftVersion.Bedrock) !== (next === MinecraftVersion.Bedrock);

export const applyMinecraftVersionChange = (nextVersion: MinecraftVersion) => {
  const prevVersion = useSettingsStore.getState().minecraftVersion;

  if (nextVersion === prevVersion) {
    return;
  }

  if (isCrossPlatformVersionSwitch(prevVersion, nextVersion)) {
    useRecipeStore.getState().clearAllSlots();
    useUIStore.getState().clearInteractionState();
  }

  trackMinecraftVersionChange({
    prev_minecraft_version: prevVersion,
    minecraft_version: nextVersion,
  });
  useSettingsStore.getState().setMinecraftVersion(nextVersion);
};
