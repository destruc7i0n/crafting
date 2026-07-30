import { useMemo } from "react";

import { getRawId } from "@/data/models/identifier/utilities";
import { CustomItem, Item, TagItem } from "@/data/models/types";
import { useFuzzySearch } from "@/hooks/use-fuzzy-search";

import { ValueOption } from "./value-list";

/**
 * Single source of truth for what may be added to a custom tag. Kept pure and separate from the
 * hook so it can be tested — custom items were silently dropped from this list once already.
 */
export function buildTagValueOptions({
  customItems,
  items,
  vanillaTagItems,
  customTagItems,
}: {
  customItems: CustomItem[];
  items: Item[];
  vanillaTagItems: TagItem[];
  customTagItems: TagItem[];
}): ValueOption[] {
  const toTagOption = (tagItem: TagItem) => ({
    kind: "tag" as const,
    tagItem,
    rawId: getRawId(tagItem.id),
  });

  return [
    // user-created items first, so they aren't buried under the vanilla catalogue
    ...customItems.map((item) => ({ kind: "item" as const, item })),
    ...items.map((item) => ({ kind: "item" as const, item })),
    ...vanillaTagItems.map(toTagOption),
    ...customTagItems.map(toTagOption),
  ];
}

export function useFilteredValueOptions({
  customItems,
  items,
  vanillaTagItems,
  customTagItems,
  valueSearch,
}: {
  customItems: CustomItem[];
  items: Item[];
  vanillaTagItems: TagItem[];
  customTagItems: TagItem[];
  valueSearch: string;
}): ValueOption[] {
  const matchedCustomItems = useFuzzySearch(customItems, valueSearch, (item) => [
    item.displayName,
    getRawId(item.id),
  ]);
  const matchedItems = useFuzzySearch(items, valueSearch, (item) => [
    item.displayName,
    getRawId(item.id),
  ]);
  const matchedVanillaTagItems = useFuzzySearch(vanillaTagItems, valueSearch, (ti) => [
    ti.displayName,
    getRawId(ti.id),
  ]);
  const matchedCustomTagItems = useFuzzySearch(customTagItems, valueSearch, (ti) => [
    ti.displayName,
    getRawId(ti.id),
  ]);

  return useMemo(
    () =>
      buildTagValueOptions({
        customItems: matchedCustomItems,
        items: matchedItems,
        vanillaTagItems: matchedVanillaTagItems,
        customTagItems: matchedCustomTagItems,
      }),
    [matchedCustomItems, matchedItems, matchedVanillaTagItems, matchedCustomTagItems],
  );
}
