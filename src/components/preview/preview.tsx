import { memo, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { DownloadIcon } from "lucide-react";

import { downloadBlob } from "@/data/datapack";
import { RecipeType } from "@/data/types";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipeType } from "@/stores/recipe/selectors";
import { useUIStore } from "@/stores/ui";

import { ItemInfoBox } from "../item/item-info-box";
import { CraftingGridPreview } from "./crafting-grid";
import { FurnacePreview } from "./furnace";
import { SmithingPreview } from "./smithing";
import { StonecutterPreview } from "./stonecutter";

export const Preview = memo(() => {
  const recipeType = useRecipeStore(selectCurrentRecipeType);
  const selectedPreview = useUIStore((state) => state.selectedPreview);
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
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

  const handleDownloadPreview = async () => {
    const element = previewRef.current;

    if (!element || isDownloading) {
      return;
    }

    try {
      setIsDownloading(true);

      const scale = 2;
      const { domToBlob } = await import("modern-screenshot");
      const blob = await domToBlob(element, {
        backgroundColor: null,
        fetch: {
          bypassingCache: true,
        },
        height: element.offsetHeight * scale,
        style: {
          height: `${element.offsetHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: `${element.offsetWidth}px`,
        },
        width: element.offsetWidth * scale,
      });

      downloadBlob(
        blob,
        recipeType === RecipeType.Crafting ? "crafting-grid.png" : `${recipeType}-preview.png`,
      );
    } catch (error) {
      console.error("Image generation error", error);
      window.alert("Could not download preview image.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full pb-1">
      <div
        className="w-full overflow-x-auto"
        style={
          {
            "--minecraft-slot-bg": "0 0% 54.51%",
            "--minecraft-slot-border-tl": "#373737",
            "--minecraft-slot-border-br": "#ffffff",
          } as CSSProperties
        }
      >
        <div className="group relative mx-auto w-fit min-w-0">
          <div ref={previewRef} className="w-fit min-w-0">
            {preview}
          </div>

          <div className="pointer-events-none absolute right-2 bottom-2 z-10 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
            <button
              type="button"
              className="border-border/60 bg-background/80 text-muted-foreground hover:bg-accent hover:text-foreground pointer-events-auto inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded border shadow-sm backdrop-blur-sm transition-colors disabled:cursor-wait disabled:opacity-60"
              onClick={handleDownloadPreview}
              disabled={isDownloading}
              title={isDownloading ? "Saving screenshot" : "Download screenshot"}
            >
              <DownloadIcon size={12} />
              <span className="sr-only">{isDownloading ? "Saving screenshot" : "Screenshot"}</span>
            </button>
          </div>
        </div>
      </div>

      {selectedPreview && (
        <div className="px-2 pt-2 lg:hidden">
          <ItemInfoBox item={selectedPreview.item} slot={selectedPreview.slot} />
        </div>
      )}
    </div>
  );
});

Preview.displayName = "Preview";
