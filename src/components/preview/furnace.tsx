import { useItemSelection } from "@/hooks/use-item-selection";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe } from "@/stores/recipe/selectors";

import { renderCreatorPreviewSlot } from "./creator-preview-slot";
import { FurnacePreviewSurface } from "./recipe-preview-surface";

export const FurnacePreview = () => {
  const selection = useItemSelection();
  const recipe = useRecipeStore(selectCurrentRecipe);

  return (
    <FurnacePreviewSurface
      slots={recipe?.slots ?? {}}
      fuelDisabled={selection !== undefined}
      renderSlot={renderCreatorPreviewSlot}
    />
  );
};
