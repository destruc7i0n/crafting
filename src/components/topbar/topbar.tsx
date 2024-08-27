import { PlusIcon, Trash2Icon } from "lucide-react";

import { useRecipeStore } from "@/stores/recipe";

export function Topbar() {
  const recipes = useRecipeStore((state) => state.recipes);
  const selectedRecipeIndex = useRecipeStore(
    (state) => state.selectedRecipeIndex,
  );

  const createRecipe = useRecipeStore((state) => state.createRecipe);
  const selectRecipe = useRecipeStore((state) => state.selectRecipe);

  const recipeState = recipes[selectedRecipeIndex];

  const handleCreateRecipe = () => {
    createRecipe();
  };

  const handleDeleteRecipe = () => {
    if (recipes.length === 1) return;
    if (confirm("Are you sure you want to delete this recipe?")) {
      // deleteRecipe();
    }
  };

  return (
    <div className="col-span-2 mb-4 flex flex-1 flex-col items-center gap-2 overflow-auto border-b pb-4 pt-2 sm:flex-row sm:justify-between">
      <div className="flex items-center gap-4">
        <input
          type="text"
          className="rounded-md border border-transparent px-2 py-1 hover:border-gray-300"
          value={recipeState.recipeName}
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleCreateRecipe}
          className="rounded-md border px-3 py-2 leading-tight"
        >
          <PlusIcon size={16} />
        </button>
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
        <button
          onClick={handleDeleteRecipe}
          className="rounded-md border px-3 py-2 leading-tight"
        >
          <Trash2Icon size={16} />
        </button>
      </div>
    </div>
  );
}
