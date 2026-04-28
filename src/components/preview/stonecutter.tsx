import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe } from "@/stores/recipe/selectors";

import { renderCreatorPreviewSlot } from "./creator-preview-slot";
import { StonecutterPreviewSurface } from "./recipe-preview-surface";

export const StonecutterPreview = () => {
  const recipe = useRecipeStore(selectCurrentRecipe);

  return (
    <StonecutterPreviewSurface slots={recipe?.slots ?? {}} renderSlot={renderCreatorPreviewSlot} />
  );
};
