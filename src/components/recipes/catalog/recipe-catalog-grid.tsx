import { useEffect, useRef } from "react";

import { useWindowVirtualizer } from "@tanstack/react-virtual";

import type { GeneratedRecipeCatalogEntry } from "@/recipes/catalog/types";
import type { VersionResourceData } from "@/stores/resources";

import { RecipeCatalogCard } from "./recipe-catalog-card";
import { useElementScrollMargin, useElementWidth } from "./use-element-width";

const cardMinWidth = 360;
const rowHeight = 264;
const rowOverscan = 1;

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
  const width = useElementWidth(gridRef, cardMinWidth);
  const measuredScrollMargin = useElementScrollMargin(gridRef);
  const scrollMargin = measuredScrollMargin ?? 0;
  const columns = Math.max(1, Math.floor(Math.max(width, cardMinWidth) / cardMinWidth));
  const rowCount = Math.ceil(recipes.length / columns);
  const rowVirtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => rowHeight,
    overscan: rowOverscan,
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
      style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
    >
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const rowStart = virtualRow.index * columns;
        const rowRecipes = recipes.slice(rowStart, rowStart + columns);

        return (
          <div
            key={virtualRow.key}
            className="absolute top-0 left-0 grid w-full gap-4 will-change-transform"
            style={{
              transform: `translate3d(0, ${virtualRow.start - scrollMargin}px, 0)`,
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {rowRecipes.map(({ entry, title }) => (
              <RecipeCatalogCard key={entry.id} entry={entry} title={title} resources={resources} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
