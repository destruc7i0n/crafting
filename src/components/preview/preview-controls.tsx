import { useState, type MouseEvent, type RefObject } from "react";

import { EraserIcon, ImageDownIcon } from "lucide-react";

import { Popover } from "@/components/popover/popover";
import { Tooltip } from "@/components/tooltip/tooltip";
import { useIsTouchDevice } from "@/hooks/use-is-touch-device";
import { trackRecipeAction } from "@/lib/analytics";
import { clearSelectedRecipeAndSlotSelection } from "@/lib/editor-actions";
import { cn } from "@/lib/utils";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe, selectCurrentRecipeType } from "@/stores/recipe/selectors";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";

import { PreviewExportOptions } from "./preview-export-options";
import { usePreviewImageExport } from "./use-preview-image-export";

type PreviewControlsProps = {
  previewRef: RefObject<HTMLDivElement | null>;
};

export function PreviewControls({ previewRef }: PreviewControlsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportMenuKey, setExportMenuKey] = useState(0);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const recipeType = useRecipeStore(selectCurrentRecipeType);
  const hasFilledSlots = useRecipeStore((state) =>
    Object.values(selectCurrentRecipe(state)?.slots ?? {}).some((slotItem) => slotItem != null),
  );
  const recipeCount = useRecipeStore((state) => state.recipes.length);
  const minecraftVersion = useSettingsStore(selectMinecraftVersion);
  const isTouchDevice = useIsTouchDevice();
  const exportPreviewImage = usePreviewImageExport(previewRef);

  const canUseQuickExportShortcut = !isTouchDevice;

  const handleDownloadPreview = async (options?: { closeMenu?: boolean }) => {
    if (isExporting) {
      return;
    }

    setIsExporting(true);

    try {
      const exported = await exportPreviewImage();

      if (exported && options?.closeMenu) {
        setIsExportMenuOpen(false);
        setExportMenuKey((value) => value + 1);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!event.shiftKey) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    void handleDownloadPreview();
  };

  const handleClearRecipe = () => {
    if (!hasFilledSlots || !recipeType) {
      return;
    }

    clearSelectedRecipeAndSlotSelection();
    trackRecipeAction({
      action: "clear",
      minecraft_version: minecraftVersion,
      recipe_count: recipeCount,
      recipe_type: recipeType,
    });
  };

  return (
    <div
      className={cn(
        "absolute right-2 bottom-2 z-10 flex items-center gap-1 transition-opacity",
        isTouchDevice || isExporting
          ? "opacity-100"
          : "pointer-events-none opacity-0 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100",
        isExportMenuOpen && "pointer-events-auto opacity-100",
      )}
    >
      <Popover
        key={exportMenuKey}
        placement="top-end"
        className="w-56 p-2 text-sm"
        content={
          <PreviewExportOptions
            canUseQuickExportShortcut={canUseQuickExportShortcut}
            isExporting={isExporting}
            onDownloadPreview={() => void handleDownloadPreview({ closeMenu: true })}
          />
        }
        onOpenChange={setIsExportMenuOpen}
      >
        <Tooltip content="Preview item options" placement="top" disabled={isExportMenuOpen}>
          <button
            type="button"
            className="border-border bg-background/90 text-foreground hover:bg-accent active:bg-accent/80 focus-visible:ring-ring inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-inset disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleExportButtonClick}
            aria-label="Preview item options"
          >
            <ImageDownIcon size={14} />
            <span className="sr-only">Preview Item Options</span>
          </button>
        </Tooltip>
      </Popover>

      <Tooltip content="Clear recipe" placement="top-end">
        <button
          type="button"
          className="border-border bg-background/90 text-foreground hover:bg-accent active:bg-accent/80 focus-visible:ring-ring inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-inset disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleClearRecipe}
          disabled={!hasFilledSlots}
          aria-label="Clear recipe"
        >
          <EraserIcon size={14} />
          <span className="sr-only">Clear Recipe</span>
        </button>
      </Tooltip>
    </div>
  );
}
