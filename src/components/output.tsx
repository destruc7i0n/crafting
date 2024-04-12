import { generate } from "@/data/generate/crafting";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe } from "@/stores/recipe/selectors";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";

export const Output = () => {
  const minecraftVersion = useSettingsStore(selectMinecraftVersion);
  const recipeState = useRecipeStore(selectCurrentRecipe);

  const result = generate(recipeState, minecraftVersion);

  return (
    <div>
      <h2>Output</h2>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
};
