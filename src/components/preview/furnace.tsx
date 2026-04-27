import { RecipeType } from "@/data/types";
import { useItemSelection } from "@/hooks/use-item-selection";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe } from "@/stores/recipe/selectors";

import { renderCreatorPreviewSlot } from "./creator-preview-slot";
import { RecipePreviewSurface } from "./recipe-preview-surface";

export const FurnacePreview = () => {
  const selection = useItemSelection();
  const recipe = useRecipeStore(selectCurrentRecipe);

  return (
    <RecipePreviewSurface
      recipeType={RecipeType.Smelting}
      slots={recipe?.slots ?? {}}
      furnaceFuelDisabled={selection !== undefined}
      renderSlot={renderCreatorPreviewSlot}
    />
  );
};
