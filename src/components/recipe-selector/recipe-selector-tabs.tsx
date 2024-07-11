import { useRecipeStore } from "@/stores/recipe";

import { RecipeSelectorTab } from "./recipe-selector-tab";

export function RecipeSelectorTabs() {
  const { recipes, createRecipe, selectRecipe, selectedRecipe } =
    useRecipeStore();

  const handleAddRecipe = () => {
    createRecipe();
  };

  return (
    <div className="col-span-2 flex flex-1 items-center gap-2 overflow-auto py-2">
      {recipes.map((recipe, index) => (
        <RecipeSelectorTab
          key={`recipe-${index}`}
          recipe={recipe}
          selected={index === selectedRecipe}
          select={() => {
            selectRecipe(index);
          }}
        />
      ))}
      <button
        className="text-nowrap rounded-md border p-2"
        onClick={handleAddRecipe}
      >
        Add Recipe
      </button>
    </div>
  );
}
