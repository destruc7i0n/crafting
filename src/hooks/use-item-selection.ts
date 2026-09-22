import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe } from "@/stores/recipe/selectors";
import { useUIStore } from "@/stores/ui";

import { useIsTouchDevice } from "./use-is-touch-device";

export const useItemSelection = () => {
  const isTouchDevice = useIsTouchDevice();
  const selection = useUIStore((state) => (isTouchDevice ? state.selection : undefined));
  const value = useRecipeStore((state) => {
    if (selection?.type !== "slot") return undefined;
    return selectCurrentRecipe(state)?.slots[selection.slot];
  });

  if (!selection || selection.type === "ingredient") {
    return selection;
  }

  return value ? { ...selection, value } : undefined;
};
