import { useEffect } from "react";

import { downloadRecipeJson } from "@/lib/download/recipe";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe } from "@/stores/recipe/selectors";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";

export const useAppHotkeys = () => {
  const createRecipe = useRecipeStore((state) => state.createRecipe);
  const currentRecipe = useRecipeStore(selectCurrentRecipe);
  const minecraftVersion = useSettingsStore(selectMinecraftVersion);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMetaOrCtrl = event.metaKey || event.ctrlKey;

      if (!isMetaOrCtrl) {
        return;
      }

      if (event.key.toLowerCase() === "n" && !event.shiftKey) {
        event.preventDefault();
        createRecipe();
        return;
      }

      if (event.key.toLowerCase() === "s" && !event.shiftKey) {
        event.preventDefault();
        downloadRecipeJson(currentRecipe, minecraftVersion);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [createRecipe, currentRecipe, minecraftVersion]);
};
