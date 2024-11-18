import { useRecipeStore } from "@/stores/recipe";

export const RecipeSelectorTab = () => {
  const recipes = useRecipeStore((state) => state.recipes);
  const selectedRecipeIndex = useRecipeStore(
    (state) => state.selectedRecipeIndex,
  );
  const selectRecipe = useRecipeStore((state) => state.selectRecipe);

  return (
    <select
      className="focus:shadow-outline max-w-32 overflow-hidden text-ellipsis rounded-md border px-3 py-2 text-center text-sm leading-tight text-gray-700 focus:outline-none"
      value={selectedRecipeIndex}
      onChange={(e) => selectRecipe(Number(e.target.value))}
    >
      {recipes.map((recipe, index) => (
        <option key={index} value={index}>
          {recipe.recipeName}
        </option>
      ))}
    </select>
  );
};
