import { useShallow } from "zustand/shallow";

import { getCurrentRecipeName } from "@/lib/recipe-name";
import { useRecipeStore } from "@/stores/recipe";
import { useSettingsStore } from "@/stores/settings";
import { selectBedrockNamespace } from "@/stores/settings/selectors";

export const useCurrentRecipeName = () => {
  const bedrockNamespace = useSettingsStore(selectBedrockNamespace);

  return useRecipeStore(
    useShallow((state) =>
      getCurrentRecipeName(state.recipes, state.selectedRecipeIndex, {
        bedrockNamespace,
      }),
    ),
  );
};
