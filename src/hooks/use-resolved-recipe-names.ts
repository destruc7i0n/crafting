import { useMemo } from "react";

import { resolveRecipeNames } from "@/lib/recipe-name";
import { useRecipeStore } from "@/stores/recipe";
import { useSettingsStore } from "@/stores/settings";
import { selectBedrockNamespace } from "@/stores/settings/selectors";

export const useResolvedRecipeNames = () => {
  const recipes = useRecipeStore((state) => state.recipes);
  const bedrockNamespace = useSettingsStore(selectBedrockNamespace);

  return useMemo(
    () => resolveRecipeNames(recipes, { bedrockNamespace }),
    [recipes, bedrockNamespace],
  );
};
