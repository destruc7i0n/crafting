import { useShallow } from "zustand/shallow";

import { useSlotContext } from "@/hooks/use-slot-context";
import { getCurrentRecipeName } from "@/lib/recipe-name";
import { useRecipeStore } from "@/stores/recipe";
import { useSettingsStore } from "@/stores/settings";
import { selectBedrockNamespace } from "@/stores/settings/selectors";

export const useCurrentRecipeName = () => {
  const bedrockNamespace = useSettingsStore(selectBedrockNamespace);
  const slotContext = useSlotContext();

  return useRecipeStore(
    useShallow((state) =>
      getCurrentRecipeName({
        recipes: state.recipes,
        selectedRecipeId: state.selectedRecipeId,
        context: {
          bedrockNamespace,
        },
        slotContext,
      }),
    ),
  );
};
