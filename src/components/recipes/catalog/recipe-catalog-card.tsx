import { memo, useCallback, type CSSProperties } from "react";

import {
  RecipePreviewSurface,
  type PreviewSlotRenderOptions,
} from "@/components/preview/recipe-preview-surface";
import { CatalogPreviewSlot } from "@/components/recipes/catalog/catalog-preview-slot";
import { getRecipeFileName, getRecipeResult } from "@/recipes/catalog/display";
import { getRecipeTypeLabel } from "@/recipes/definitions";

import type { CatalogSlotValue, GeneratedRecipeCatalogEntry } from "@/recipes/catalog/types";
import type { RecipeSlot } from "@/recipes/slots";
import type { VersionResourceData } from "@/stores/resources";

type RecipeCatalogCardProps = {
  entry: GeneratedRecipeCatalogEntry;
  title: string;
  resources?: VersionResourceData;
};

export const RecipeCatalogCard = memo(function RecipeCatalogCard({
  entry,
  title,
  resources,
}: RecipeCatalogCardProps) {
  const renderSlot = useCallback(
    (slot: RecipeSlot, value: CatalogSlotValue | undefined, options?: PreviewSlotRenderOptions) => (
      <CatalogPreviewSlot slot={slot} value={value} resources={resources} options={options} />
    ),
    [resources],
  );
  const result = getRecipeResult(entry);
  const outputId = result?.value.kind === "item" ? result.value.id : undefined;

  return (
    <article
      className="border-border bg-card text-card-foreground flex h-[248px] min-w-0 flex-col rounded-lg border p-2 [contain:layout_paint_style]"
      style={
        {
          "--minecraft-slot-bg": "0 0% 54.51%",
          "--minecraft-slot-border-tl": "#373737",
          "--minecraft-slot-border-br": "#ffffff",
        } as CSSProperties
      }
    >
      <div className="min-w-0">
        <div className="flex min-w-0 items-start gap-2">
          <h2 className="min-w-0 flex-1 truncate text-sm leading-5 font-semibold capitalize">
            {title}
          </h2>
          <span className="border-primary/35 bg-primary/10 text-primary dark:border-primary/30 dark:bg-primary/15 shrink-0 rounded-md border px-2 py-1 text-xs leading-4 font-semibold select-none">
            {getRecipeTypeLabel(entry.recipeType)}
          </span>
        </div>
        {outputId ? (
          <p className="text-muted-foreground truncate text-xs leading-4">
            <span className="font-medium select-none">Output Item ID: </span>
            {outputId}
          </p>
        ) : null}
        <p className="text-muted-foreground truncate text-xs leading-4">
          <span className="font-medium select-none">File: </span>
          {getRecipeFileName(entry)}
        </p>
      </div>

      <div className="mt-2 flex flex-1 items-center justify-center overflow-hidden">
        <div className="scrollbar-app scrollbar-app-thin max-w-full overflow-x-auto">
          <RecipePreviewSurface<CatalogSlotValue>
            recipeType={entry.recipeType}
            slots={entry.slots}
            renderSlot={renderSlot}
          />
        </div>
      </div>
    </article>
  );
});

RecipeCatalogCard.displayName = "RecipeCatalogCard";
