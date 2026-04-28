import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe } from "@/stores/recipe/selectors";

import { renderCreatorPreviewSlot } from "./creator-preview-slot";
import { SmithingPreviewSurface } from "./recipe-preview-surface";

export const SmithingPreview = () => {
  const recipe = useRecipeStore(selectCurrentRecipe);

  return (
    <SmithingPreviewSurface slots={recipe?.slots ?? {}} renderSlot={renderCreatorPreviewSlot} />
  );
};
