import { RecipeType } from "@/data/types";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipeType } from "@/stores/recipe/selectors";

import { CraftingGridPreview } from "./crafting-grid";
import { FurnacePreview } from "./furnace";
import { SmithingPreview } from "./smithing";
import { StonecutterPreview } from "./stonecutter";

export const MinecraftUIPreview = () => {
  const recipeType = useRecipeStore(selectCurrentRecipeType);

  switch (recipeType) {
    case RecipeType.Crafting: {
      return <CraftingGridPreview />;
    }
    case RecipeType.Smelting:
    case RecipeType.Blasting:
    case RecipeType.CampfireCooking: {
      return <FurnacePreview />;
    }
    case RecipeType.Smithing:
    case RecipeType.SmithingTransform:
    case RecipeType.SmithingTrim: {
      return <SmithingPreview />;
    }
    case RecipeType.Stonecutter: {
      return <StonecutterPreview />;
    }
    default: {
      return null;
    }
  }
};
