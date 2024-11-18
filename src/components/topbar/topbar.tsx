import { PlusIcon, Trash2Icon } from "lucide-react";

import { useRecipeStore } from "@/stores/recipe";

import { RecipeNameInput } from "./recipe-name-input";
import { RecipeSelectorTab } from "./recipe-selector";

export function Topbar() {
  const recipeCount = useRecipeStore((state) => state.recipes.length);
  const selectedRecipeIndex = useRecipeStore(
    (state) => state.selectedRecipeIndex,
  );

  const createRecipe = useRecipeStore((state) => state.createRecipe);
  const deleteRecipe = useRecipeStore((state) => state.deleteRecipe);

  const handleCreateRecipe = () => {
    createRecipe();
  };

  const handleDeleteRecipe = () => {
    if (recipeCount === 1) return;
    if (confirm("Are you sure you want to delete this recipe?")) {
      deleteRecipe(selectedRecipeIndex);
    }
  };

  return (
    <div className="col-span-2 mb-4 flex flex-1 flex-col items-center gap-2 overflow-auto border-b pb-4 pt-2 sm:flex-row sm:justify-between">
      <div className="flex items-center gap-4">
        <RecipeNameInput />
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleCreateRecipe}
          className="rounded-md border px-3 py-2 leading-tight"
        >
          <PlusIcon size={16} />
        </button>
        <RecipeSelectorTab />
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
