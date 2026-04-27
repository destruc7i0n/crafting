import { RecipeType } from "@/data/types";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe } from "@/stores/recipe/selectors";

import { renderCreatorPreviewSlot } from "./creator-preview-slot";
import { RecipePreviewSurface } from "./recipe-preview-surface";

export const StonecutterPreview = () => {
  const recipe = useRecipeStore(selectCurrentRecipe);

  return (
    <RecipePreviewSurface
      recipeType={RecipeType.Stonecutter}
      slots={recipe?.slots ?? {}}
      renderSlot={renderCreatorPreviewSlot}
    />
  );
};
