import { useMemo } from "react";

import { getRawId } from "@/data/models/identifier/utilities";
import { Item, TagItem } from "@/data/models/types";
import { useFuzzySearch } from "@/hooks/use-fuzzy-search";

import { ValueOption } from "./value-list";

export function useFilteredValueOptions({
  items,
  vanillaTagItems,
  customTagItems,
  valueSearch,
}: {
  items: Item[];
  vanillaTagItems: TagItem[];
  customTagItems: TagItem[];
  valueSearch: string;
}): ValueOption[] {
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

  return useMemo<ValueOption[]>(
    () => [
      ...matchedItems.map((item) => ({ kind: "item" as const, item })),
      ...matchedVanillaTagItems.map((tagItem) => ({
        kind: "tag" as const,
        tagItem,
        rawId: getRawId(tagItem.id),
      })),
      ...matchedCustomTagItems.map((tagItem) => ({
        kind: "tag" as const,
        tagItem,
        rawId: getRawId(tagItem.id),
      })),
    ],
    [matchedItems, matchedVanillaTagItems, matchedCustomTagItems],
  );
}
