import { memo, type ReactNode } from "react";

import { RecipeType } from "@/data/types";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipeType } from "@/stores/recipe/selectors";

import { CraftingGridPreview } from "./crafting-grid";
import { FurnacePreview } from "./furnace";
import { SmithingPreview } from "./smithing";
import { StonecutterPreview } from "./stonecutter";

export const Preview = memo(() => {
  const recipeType = useRecipeStore(selectCurrentRecipeType);

  let preview: ReactNode = null;

  switch (recipeType) {
    case RecipeType.Crafting: {
      preview = <CraftingGridPreview />;
      break;
    }
    case RecipeType.Smelting:
    case RecipeType.Blasting:
    case RecipeType.Smoking:
    case RecipeType.CampfireCooking: {
      preview = <FurnacePreview />;
      break;
    }
    case RecipeType.Smithing:
    case RecipeType.SmithingTransform:
    case RecipeType.SmithingTrim: {
      preview = <SmithingPreview />;
      break;
    }
    case RecipeType.Stonecutter: {
      preview = <StonecutterPreview />;
      break;
    }
    default: {
      preview = null;
    }
  }

  if (!preview) {
    return null;
  }

  return (
    <div
      className="w-full overflow-x-auto pb-1"
      style={
        {
          "--minecraft-slot-bg": "0 0% 54.51%",
          "--minecraft-slot-border-tl": "#373737",
          "--minecraft-slot-border-br": "#ffffff",
        } as React.CSSProperties
      }
    >
      <div className="mx-auto w-[352px]">{preview}</div>
    </div>
  );
});

Preview.displayName = "Preview";
