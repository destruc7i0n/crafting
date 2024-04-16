import { recipeTypeToName } from "@/data/constants";
import { RecipeType } from "@/data/types";
import { getSupportedRecipeTypesForVersion } from "@/data/versions";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipeType } from "@/stores/recipe/selectors";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";

export const RecipeTypeSelector = () => {
  const minecraftVersion = useSettingsStore(selectMinecraftVersion);
  const recipeType = useRecipeStore(selectCurrentRecipeType);
  const setRecipeType = useRecipeStore((state) => state.setRecipeType);

  const supportedRecipeTypes =
    getSupportedRecipeTypesForVersion(minecraftVersion);

  return (
    <select
      className="focus:shadow-outline appearance-none rounded-md border px-3 py-2 text-center text-sm leading-tight text-gray-700 focus:outline-none"
      onChange={(e) => setRecipeType(e.target.value as RecipeType)}
      value={recipeType}
    >
      {supportedRecipeTypes.map((type) => (
        <option key={type} value={type}>
          {recipeTypeToName[type]}
        </option>
      ))}
    </select>
  );
};
