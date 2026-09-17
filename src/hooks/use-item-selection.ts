import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe } from "@/stores/recipe/selectors";
import { useUIStore } from "@/stores/ui";

import { useIsTouchDevice } from "./use-is-touch-device";

export const useItemSelection = () => {
  const isTouchDevice = useIsTouchDevice();
  const selection = useUIStore((state) => (isTouchDevice ? state.selection : undefined));
  const recipe = useRecipeStore(selectCurrentRecipe);

  if (!selection || selection.type === "ingredient") {
    return selection;
  }

  const value = recipe?.slots[selection.slot];
  return value ? { ...selection, value } : undefined;
};
