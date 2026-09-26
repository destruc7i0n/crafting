import { useMemo } from "react";

import { buildCustomItemsById, ItemLookup } from "@/lib/tags";
import { useCustomItemStore } from "@/stores/custom-item";

import { useResourcesForVersion } from "./use-resources-for-version";

// only the small custom item list is mapped, so this is cheap enough to call per slot
export const useItemLookup = (): ItemLookup => {
  const { resources } = useResourcesForVersion();
  const customItems = useCustomItemStore((state) => state.customItems);

  const customItemsById = useMemo(() => buildCustomItemsById(customItems), [customItems]);

  return useMemo(
    () => ({ itemsById: resources?.itemsById, customItemsById }),
    [customItemsById, resources],
  );
};
