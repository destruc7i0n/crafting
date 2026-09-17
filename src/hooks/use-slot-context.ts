import { useMemo } from "react";

import { useCustomItemStore } from "@/stores/custom-item";
import { SlotContext } from "@/stores/recipe/types";
import { useTagStore } from "@/stores/tag";

import { usePotionCatalogForMinecraftVersion } from "./use-potion-catalog-for-version";
import { useResourcesForVersion } from "./use-resources-for-version";

const toByUidMap = <T extends { uid: string }>(values: T[]): Record<string, T> =>
  Object.fromEntries(values.map((value) => [value.uid, value]));

export const useSlotContext = (): SlotContext => {
  const { resources, version } = useResourcesForVersion();
  const { catalog: potionCatalog, error: potionCatalogError } =
    usePotionCatalogForMinecraftVersion(version);
  const customItems = useCustomItemStore((state) => state.customItems);
  const tags = useTagStore((state) => state.tags);

  return useMemo(
    () => ({
      version,
      resources,
      potionCatalog,
      potionCatalogError,
      customItemsByUid: toByUidMap(customItems),
      tagsByUid: toByUidMap(tags),
      allTags: tags,
      vanillaTags: resources?.vanillaTags ?? {},
    }),
    [customItems, resources, tags, version, potionCatalog, potionCatalogError],
  );
};
