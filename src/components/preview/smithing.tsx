import { RecipeType } from "@/data/types";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe, selectCurrentRecipeType } from "@/stores/recipe/selectors";

import { renderCreatorPreviewSlot } from "./creator-preview-slot";
import { RecipePreviewSurface } from "./recipe-preview-surface";

export const SmithingPreview = () => {
  const recipe = useRecipeStore(selectCurrentRecipe);
  const recipeType = useRecipeStore(selectCurrentRecipeType);

  return (
    <RecipePreviewSurface
      recipeType={recipeType ?? RecipeType.SmithingTransform}
      slots={recipe?.slots ?? {}}
      renderSlot={renderCreatorPreviewSlot}
    />
  );
};
