import { memo, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { EraserIcon, ImageDownIcon } from "lucide-react";

import { ItemInfoBox } from "@/components/selected-item-info-box/item-info-box";
import { Tooltip } from "@/components/tooltip/tooltip";
import { downloadBlob } from "@/data/datapack";
import { RecipeType } from "@/data/types";
import { useCurrentRecipeName } from "@/hooks/use-current-recipe-name";
import { useItemSelection } from "@/hooks/use-item-selection";
import { getPreviewBaseName, toPreviewFileName } from "@/lib/recipe-name";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe, selectCurrentRecipeType } from "@/stores/recipe/selectors";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";
import { useUIStore } from "@/stores/ui";

import { CraftingGridPreview } from "./crafting-grid";
import { FurnacePreview } from "./furnace";
import { SmithingPreview } from "./smithing";
import { StonecutterPreview } from "./stonecutter";

const ACTION_BUTTON_CLASS_NAME =
  "border-border bg-background text-foreground hover:bg-accent active:bg-accent/80 inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

export const Preview = memo(() => {
  const recipe = useRecipeStore(selectCurrentRecipe);
  const recipeType = useRecipeStore(selectCurrentRecipeType);
  const clearSelectedRecipeSlots = useRecipeStore((state) => state.clearSelectedRecipeSlots);
  const minecraftVersion = useSettingsStore(selectMinecraftVersion);
  const naming = useCurrentRecipeName();
  const selection = useItemSelection();
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const hasFilledSlots = Object.values(recipe?.slots ?? {}).some((slotItem) => slotItem != null);
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

      const previewBaseName = naming ? getPreviewBaseName(naming, minecraftVersion) : undefined;
      const fileName =
        (previewBaseName ? toPreviewFileName(previewBaseName) : undefined) ??
        (recipeType === RecipeType.Crafting ? "crafting-grid.png" : `${recipeType}-preview.png`);

      downloadBlob(blob, fileName);
    } catch (error) {
      console.error("Image generation error", error);
      window.alert("Could not download preview image.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClearRecipe = () => {
    if (!hasFilledSlots) {
      return;
    }

    clearSelectedRecipeSlots();

    if (useUIStore.getState().selection?.type === "preview") {
      useUIStore.getState().setSelection(undefined);
    }
  };

  return (
    <div
      className="flex w-full flex-col"
      style={
        {
          "--minecraft-slot-bg": "0 0% 54.51%",
          "--minecraft-slot-border-tl": "#373737",
          "--minecraft-slot-border-br": "#ffffff",
        } as CSSProperties
      }
    >
      <div className="w-full overflow-x-auto">
        <div className="mx-auto w-fit min-w-0">
          <div ref={previewRef} className="w-fit min-w-0">
            {preview}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {selection ? (
          <div className="min-w-0 flex-1">
            <div className="border-border/70 border-t pt-3">
              {selection.type === "preview" ? (
                <ItemInfoBox item={selection.item} slot={selection.slot} />
              ) : (
                <ItemInfoBox item={selection.item} />
              )}
            </div>
          </div>
        ) : null}

        <div className="flex justify-center">
          <div className="flex shrink-0 items-center justify-end gap-2">
            <Tooltip
              content={isDownloading ? "Saving preview image" : "Download preview image"}
              placement="bottom"
            >
              <button
                type="button"
                className={ACTION_BUTTON_CLASS_NAME}
                onClick={handleDownloadPreview}
                disabled={isDownloading}
                aria-label={isDownloading ? "Saving preview image" : "Download preview image"}
              >
                <ImageDownIcon size={14} />
                <span>{isDownloading ? "Saving Image" : "Save Image"}</span>
              </button>
            </Tooltip>

            <Tooltip content="Clear recipe" placement="bottom">
              <button
                type="button"
                className={ACTION_BUTTON_CLASS_NAME}
                onClick={handleClearRecipe}
                disabled={!hasFilledSlots}
                aria-label="Clear recipe"
              >
                <EraserIcon size={14} />
                <span>Clear Recipe</span>
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
});

Preview.displayName = "Preview";
