import { memo, useMemo, type ComponentPropsWithRef, type ReactNode } from "react";

import { NoTextureTexture } from "@/data/constants";
import { useItemLookup } from "@/hooks/use-item-lookup";
import { useTagCycleIndex } from "@/hooks/use-tag-cycle-tick";
import { lookupItem } from "@/lib/tags";

import type { CustomItem, Item } from "@/data/models/types";

import { ItemPreview } from "./item-preview";

type PreviewItem = Item | CustomItem;

type CyclingItemPreviewProps = {
  itemIds: string[];
  itemsById?: Record<string, Item>;
  active?: boolean;
  render?: (state: { currentItem: PreviewItem | undefined; preview: ReactNode }) => ReactNode;
} & Omit<ComponentPropsWithRef<typeof ItemPreview>, "texture">;

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
  currentItem: PreviewItem | undefined;
  texture: string;
} {
  // falls back to the shared lookup so custom items inside a tag resolve too
  const fallbackLookup = useItemLookup();
  const lookup = useMemo(
    () => (itemsById ? { itemsById } : fallbackLookup),
    [itemsById, fallbackLookup],
  );

  const visibleItems = useMemo(
    () =>
      itemIds
        .map((itemId) => lookupItem(lookup, itemId))
        .filter((item): item is PreviewItem => item !== undefined),
    [itemIds, lookup],
  );

  const cycleIndex = useTagCycleIndex(active ? visibleItems.length : 0);
  const currentItem = visibleItems.length > 0 ? visibleItems[active ? cycleIndex : 0] : undefined;

  return {
    currentItem,
    texture: currentItem?.texture ?? NoTextureTexture,
  };
}

export const CyclingItemPreview = memo(function CyclingItemPreview({
  ref,
  itemIds,
  itemsById,
  alt,
  active = true,
  render,
  ...props
}: CyclingItemPreviewProps) {
  const { currentItem, texture } = useCyclingItemPreviewState({ itemIds, itemsById, active });
  const preview = <ItemPreview {...props} ref={ref} alt={alt} texture={texture} />;

  return render ? render({ currentItem, preview }) : preview;
});
