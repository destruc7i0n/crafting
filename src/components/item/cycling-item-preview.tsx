import { ComponentPropsWithoutRef, forwardRef, memo, useMemo, type ReactNode } from "react";

import { NoTextureTexture } from "@/data/constants";
import { useResourcesForVersion } from "@/hooks/use-resources-for-version";
import { useTagCycleIndex } from "@/hooks/use-tag-cycle-tick";

import type { Item } from "@/data/models/types";

import { ItemPreview } from "./item-preview";

type CyclingItemPreviewProps = {
  itemIds: string[];
  itemsById?: Record<string, Item>;
  active?: boolean;
  render?: (state: { currentItem: Item | undefined; preview: ReactNode }) => ReactNode;
} & Omit<ComponentPropsWithoutRef<typeof ItemPreview>, "texture">;

type UseCyclingItemPreviewStateArgs = {
  itemIds: string[];
  itemsById?: Record<string, Item>;
  active?: boolean;
};

function useCyclingItemPreviewState({
  itemIds,
  itemsById,
  active = true,
}: UseCyclingItemPreviewStateArgs): {
  currentItem: Item | undefined;
  texture: string;
} {
  const { resources } = useResourcesForVersion();
  const resolvedItemsById = itemsById ?? resources?.itemsById;

  const visibleItems = useMemo(
    () =>
      itemIds
        .map((itemId) => resolvedItemsById?.[itemId])
        .filter((item): item is Item => item !== undefined),
    [itemIds, resolvedItemsById],
  );

  const cycleIndex = useTagCycleIndex(active ? visibleItems.length : 0);
  const currentItem = visibleItems.length > 0 ? visibleItems[active ? cycleIndex : 0] : undefined;

  return {
    currentItem,
    texture: currentItem?.texture ?? NoTextureTexture,
  };
}

export const CyclingItemPreview = memo(
  forwardRef<HTMLImageElement, CyclingItemPreviewProps>(
    ({ itemIds, itemsById, alt, active = true, render, ...props }, ref) => {
      const { currentItem, texture } = useCyclingItemPreviewState({ itemIds, itemsById, active });
      const preview = <ItemPreview {...props} ref={ref} alt={alt} texture={texture} />;

      return render ? render({ currentItem, preview }) : preview;
    },
  ),
);

CyclingItemPreview.displayName = "CyclingItemPreview";
