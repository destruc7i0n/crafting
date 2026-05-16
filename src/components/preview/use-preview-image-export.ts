import { type RefObject } from "react";

import { downloadBlob } from "@/data/datapack";
import { RecipeType } from "@/data/types";
import { useCurrentRecipeName } from "@/hooks/use-current-recipe-name";
import { trackPreviewScreenshot } from "@/lib/analytics";
import { getPreviewBaseName, toPreviewFileName } from "@/recipes/naming";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipeType } from "@/stores/recipe/selectors";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";
import { useUIStore } from "@/stores/ui";

export function usePreviewImageExport(previewRef: RefObject<HTMLDivElement | null>) {
  const recipeType = useRecipeStore(selectCurrentRecipeType);
  const minecraftVersion = useSettingsStore(selectMinecraftVersion);
  const naming = useCurrentRecipeName();
  const previewExportOptions = useUIStore((state) => state.previewExportOptions);

  return async () => {
    const element = previewRef.current;

    if (!element || !recipeType) {
      return false;
    }

    try {
      const scale = 2;
      const { domToBlob } = await import("modern-screenshot");
      const blob = await domToBlob(element, {
        backgroundColor: null,
        fetch: {
          bypassingCache: true,
        },
        filter: previewExportOptions.hideSingleItemCount
          ? (node) => !(node instanceof HTMLElement && node.dataset.previewOutputCount === "1")
          : undefined,
        height: element.offsetHeight * scale,
        style: {
          height: `${element.offsetHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: `${element.offsetWidth}px`,
        },
        width: element.offsetWidth * scale,
      });

      const previewBaseName = naming ? getPreviewBaseName(naming, minecraftVersion) : undefined;
      const fileName =
        (previewBaseName ? toPreviewFileName(previewBaseName) : undefined) ??
        (recipeType === RecipeType.Crafting ? "crafting-grid.png" : `${recipeType}-preview.png`);

      downloadBlob(blob, fileName);
      trackPreviewScreenshot({ recipe_type: recipeType });

      return true;
    } catch (error) {
      console.error("Image generation error", error);
      window.alert("Could not download preview image.");

      return false;
    }
  };
}
