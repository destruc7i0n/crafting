import { useMemo } from "react";

import { useSlotContext } from "@/hooks/use-slot-context";
import { getCurrentRecipeName } from "@/recipes/naming";
import { useRecipeStore } from "@/stores/recipe";
import { useSettingsStore } from "@/stores/settings";
import { selectBedrockNamespace } from "@/stores/settings/selectors";

export const useCurrentRecipeName = () => {
  const bedrockNamespace = useSettingsStore(selectBedrockNamespace);
  const slotContext = useSlotContext();
  const recipes = useRecipeStore((state) => state.recipes);
  const selectedRecipeId = useRecipeStore((state) => state.selectedRecipeId);

  return useMemo(
    () =>
      getCurrentRecipeName({
        recipes,
        selectedRecipeId,
        context: {
          bedrockNamespace,
        },
        slotContext,
      }),
    [recipes, selectedRecipeId, bedrockNamespace, slotContext],
  );
};
