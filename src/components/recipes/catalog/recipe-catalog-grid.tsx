import { useEffect, useRef } from "react";

import { useWindowVirtualizer } from "@tanstack/react-virtual";

import type { GeneratedRecipeCatalogEntry } from "@/recipes/catalog/types";
import type { VersionResourceData } from "@/stores/resources";

import {
  recipeCatalogCardHeight,
  recipeCatalogCardMinWidth,
  recipeCatalogRowGap,
} from "./constants";
import { RecipeCatalogCard } from "./recipe-catalog-card";
import { useElementScrollMargin, useElementWidth } from "./use-element-width";

const overscanRows = 1;

export type CatalogGridRecipe = {
  entry: GeneratedRecipeCatalogEntry;
  title: string;
};

type RecipeCatalogGridProps = {
  recipes: CatalogGridRecipe[];
  resources?: VersionResourceData;
  scrollResetKey: string;
};

export function RecipeCatalogGrid({ recipes, resources, scrollResetKey }: RecipeCatalogGridProps) {
  const gridRef = useRef<HTMLDivElement | null>(null);

  const previousScrollResetKeyRef = useRef(scrollResetKey);
  const width = useElementWidth(gridRef, recipeCatalogCardMinWidth);

  const measuredScrollMargin = useElementScrollMargin(gridRef);
  const scrollMargin = measuredScrollMargin ?? 0;

  const columns = Math.max(
    1,
    Math.floor(
      (Math.max(width, recipeCatalogCardMinWidth) + recipeCatalogRowGap) /
        (recipeCatalogCardMinWidth + recipeCatalogRowGap),
    ),
  );
  const columnWidth = (width - recipeCatalogRowGap * (columns - 1)) / columns;

  const virtualizer = useWindowVirtualizer({
    count: recipes.length,
    estimateSize: () => recipeCatalogCardHeight,
    gap: recipeCatalogRowGap,
    lanes: columns,
    overscan: columns * overscanRows,
    scrollMargin,
  });

  useEffect(() => {
    if (
      measuredScrollMargin === undefined ||
      previousScrollResetKeyRef.current === scrollResetKey
    ) {
      return;
    }

    previousScrollResetKeyRef.current = scrollResetKey;
    window.scrollTo({ top: Math.max(0, measuredScrollMargin - 8), behavior: "auto" });
  }, [measuredScrollMargin, scrollResetKey]);

  return (
    <div
      ref={gridRef}
      className="relative w-full"
      style={{ height: `${virtualizer.getTotalSize()}px` }}
    >
      {virtualizer.getVirtualItems().map((virtualItem) => {
        const recipe = recipes[virtualItem.index];

        if (!recipe) return null;

        return (
          <div
            key={virtualItem.key}
            className="absolute top-0 left-0 will-change-transform"
            style={{
              width: `${columnWidth}px`,
              transform: `translate3d(${
                virtualItem.lane * (columnWidth + recipeCatalogRowGap)
              }px, ${virtualItem.start - scrollMargin}px, 0)`,
            }}
          >
            <RecipeCatalogCard entry={recipe.entry} title={recipe.title} resources={resources} />
          </div>
        );
      })}
    </div>
  );
}
