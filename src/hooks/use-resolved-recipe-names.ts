import { useMemo } from "react";

import { useSlotContext } from "@/hooks/use-slot-context";
import { resolveRecipeNames } from "@/lib/recipe-name";
import { useRecipeStore } from "@/stores/recipe";
import { useSettingsStore } from "@/stores/settings";
import { selectBedrockNamespace } from "@/stores/settings/selectors";

export const useResolvedRecipeNames = () => {
  const recipes = useRecipeStore((state) => state.recipes);
  const bedrockNamespace = useSettingsStore(selectBedrockNamespace);
  const slotContext = useSlotContext();

  return useMemo(
    () => resolveRecipeNames(recipes, { bedrockNamespace }, slotContext),
    [recipes, bedrockNamespace, slotContext],
  );
};
