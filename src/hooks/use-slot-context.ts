import { useMemo } from "react";

import { useCustomItemStore } from "@/stores/custom-item";
import { SlotContext } from "@/stores/recipe/types";
import { useTagStore } from "@/stores/tag";

import { useResourcesForVersion } from "./use-resources-for-version";

export const useSlotContext = (): SlotContext => {
  const { resources, version } = useResourcesForVersion();
  const customItems = useCustomItemStore((state) => state.customItems);
  const tags = useTagStore((state) => state.tags);

  return useMemo(
    () => ({
      version,
      resources,
      customItemsByUid: Object.fromEntries(customItems.map((item) => [item.uid, item])),
      tagsByUid: Object.fromEntries(tags.map((tag) => [tag.uid, tag])),
      allTags: tags,
      vanillaTags: resources?.vanillaTags ?? {},
    }),
    [customItems, resources, tags, version],
  );
};
