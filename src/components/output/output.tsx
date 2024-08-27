import { generate } from "@/data/generate";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe } from "@/stores/recipe/selectors";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";

import { JsonOutput } from "./json-output";

import "@jongwooo/prism-theme-github/themes/prism-github-default-light.min.css";

export const Output = () => {
  const minecraftVersion = useSettingsStore(selectMinecraftVersion);
  const recipeState = useRecipeStore(selectCurrentRecipe);

  const result = generate(recipeState, minecraftVersion);

  return (
    <div className="flex flex-col gap-4 rounded-md border-2">
      <JsonOutput json={result} />
    </div>
  );
};
