import { useMemo } from "react";

import { IngredientItem } from "@/data/models/types";
import { createTagItem, getCustomTagIdentifier, getTagLabel, resolveTagValues } from "@/lib/tags";
import { useResourcesForVersion } from "./use-resources-for-version";
import { useTagStore } from "@/stores/tag";

export const useResolvedSlotItem = (
  item: IngredientItem | undefined,
): IngredientItem | undefined => {
  const { resources, version } = useResourcesForVersion();
  const tags = useTagStore((state) => state.tags);

  return useMemo(() => {
    if (!item || item.type !== "tag_item" || item.tagSource !== "custom" || !item.uid) {
      return item;
    }

    const tag = tags.find((t) => t.uid === item.uid);
    if (!tag) return item;

    const vanillaTags = resources?.vanillaTags ?? {};
    const identifier = getCustomTagIdentifier(tag);
    const resolvedValues = resolveTagValues(tag.values, tags, vanillaTags);

    return createTagItem({
      rawId: identifier.raw,
      displayName: getTagLabel(identifier.raw),
      values: resolvedValues,
      version,
      itemsById: resources?.itemsById,
      tagSource: "custom",
      uid: tag.uid,
    });
  }, [item, tags, resources, version]);
};
