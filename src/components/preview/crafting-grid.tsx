import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe } from "@/stores/recipe/selectors";

import { renderCreatorPreviewSlot } from "./creator-preview-slot";
import { CraftingPreviewSurface } from "./recipe-preview-surface";

export const CraftingGridPreview = () => {
  const recipe = useRecipeStore(selectCurrentRecipe);

  return (
    <CraftingPreviewSurface
      slots={recipe?.slots ?? {}}
      twoByTwo={recipe?.crafting.twoByTwo === true}
      renderSlot={renderCreatorPreviewSlot}
    />
  );
};
