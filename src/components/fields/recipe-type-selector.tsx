import { recipeTypeToItemId, recipeTypeToName } from "@/data/constants";
import { RecipeType } from "@/data/types";
import { getSupportedRecipeTypesForVersion } from "@/data/versions";
import { useResourcesForVersion } from "@/hooks/use-resources-for-version";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipeType } from "@/stores/recipe/selectors";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";

export const RecipeTypeSelector = () => {
  const minecraftVersion = useSettingsStore(selectMinecraftVersion);
  const recipeType = useRecipeStore(selectCurrentRecipeType);
  const setRecipeType = useRecipeStore((state) => state.setRecipeType);

  const { resources } = useResourcesForVersion();

  const supportedRecipeTypes =
    getSupportedRecipeTypesForVersion(minecraftVersion);

  const recipeTexture =
    resources?.itemsById?.[recipeTypeToItemId[recipeType]!].texture;

  const recipeImage = recipeTexture ? (
    <img src={recipeTexture} className="pointer-events-none h-8 w-8" />
  ) : null;

  return (
    <div className="flex justify-center gap-2">
      <select
        className="focus:shadow-outline rounded-md border px-3 py-2 text-center text-sm leading-tight text-gray-700 focus:outline-none"
        onChange={(e) => setRecipeType(e.target.value as RecipeType)}
        value={recipeType}
      >
        {supportedRecipeTypes.map((type) => (
          <option key={type} value={type}>
            {recipeTypeToName[type]}
          </option>
        ))}
      </select>
      {recipeImage}
    </div>
  );
};
