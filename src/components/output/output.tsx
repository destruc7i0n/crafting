import { generate } from "@/data/generate";
import { RecipeType } from "@/data/types";
import { MinecraftVersion } from "@/data/types";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe } from "@/stores/recipe/selectors";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";

export const Output = () => {
  const minecraftVersion = useSettingsStore(selectMinecraftVersion);
  const recipeState = useRecipeStore(selectCurrentRecipe);
  const setRecipeType = useRecipeStore((state) => state.setRecipeType);
  const setMinecraftVersion = useSettingsStore(
    (state) => state.setMinecraftVersion,
  );

  const result = generate(recipeState, minecraftVersion);

  return (
    <div>
      <select
        onChange={(e) => setRecipeType(e.target.value as RecipeType)}
        value={recipeState.recipeType}
      >
        <option value={RecipeType.Crafting}>Crafting</option>
        <option value={RecipeType.Smelting}>Smelting</option>
        <option value={RecipeType.Blasting}>Blasting</option>
        <option value={RecipeType.CampfireCooking}>Campfire Cooking</option>
        <option value={RecipeType.Smithing}>Smithing</option>
        <option value={RecipeType.SmithingTransform}>Smithing Transform</option>
        <option value={RecipeType.SmithingTrim}>Smithing Trim</option>
        <option value={RecipeType.Stonecutter}>Stonecutter</option>
      </select>
      <select
        onChange={(e) =>
          setMinecraftVersion(e.target.value as MinecraftVersion)
        }
        value={minecraftVersion}
      >
        {Object.values(MinecraftVersion).map((version) => (
          <option key={version} value={version}>
            {version}
          </option>
        ))}
      </select>
      <h2>Output</h2>

      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
};
