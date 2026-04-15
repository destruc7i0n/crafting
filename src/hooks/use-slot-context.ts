import { useMemo } from "react";

import { useCustomItemStore } from "@/stores/custom-item";
import { SlotContext } from "@/stores/recipe/types";
import { useTagStore } from "@/stores/tag";

import { useResourcesForVersion } from "./use-resources-for-version";

const toByUidMap = <T extends { uid: string }>(values: T[]): Record<string, T> =>
  Object.fromEntries(values.map((value) => [value.uid, value]));

export const useSlotContext = (): SlotContext => {
  const { resources, version } = useResourcesForVersion();
  const customItems = useCustomItemStore((state) => state.customItems);
  const tags = useTagStore((state) => state.tags);

  return useMemo(
    () => ({
      version,
      resources,
      customItemsByUid: toByUidMap(customItems),
      tagsByUid: toByUidMap(tags),
      allTags: tags,
      vanillaTags: resources?.vanillaTags ?? {},
    }),
    [customItems, resources, tags, version],
  );
};
