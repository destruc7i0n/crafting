import { useMemo } from "react";

import { createSlotContext } from "@/lib/slot-context";
import { useCustomItemStore } from "@/stores/custom-item";
import { SlotContext } from "@/stores/recipe/types";
import { useTagStore } from "@/stores/tag";

import { useResourcesForVersion } from "./use-resources-for-version";

export const useSlotContext = (): SlotContext => {
  const { resources, version } = useResourcesForVersion();
  const customItems = useCustomItemStore((state) => state.customItems);
  const tags = useTagStore((state) => state.tags);

  return useMemo(
    () => createSlotContext({ version, resources, customItems, tags }),
    [customItems, resources, tags, version],
  );
};
