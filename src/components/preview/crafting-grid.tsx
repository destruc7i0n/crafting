import { RecipeType } from "@/data/types";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe } from "@/stores/recipe/selectors";

import { renderCreatorPreviewSlot } from "./creator-preview-slot";
import { RecipePreviewSurface } from "./recipe-preview-surface";

export const CraftingGridPreview = () => {
  const recipe = useRecipeStore(selectCurrentRecipe);

  return (
    <RecipePreviewSurface
      recipeType={RecipeType.Crafting}
      slots={recipe?.slots ?? {}}
      craftingTwoByTwo={recipe?.crafting.twoByTwo === true}
      renderSlot={renderCreatorPreviewSlot}
    />
  );
};
