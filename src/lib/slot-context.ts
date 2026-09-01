import { CustomItem, Tag } from "@/data/models/types";
import { MinecraftVersion } from "@/data/types";
import { useCustomItemStore } from "@/stores/custom-item";
import { SlotContext } from "@/stores/recipe/types";
import { VersionResourceData, useResourcesStore } from "@/stores/resources";
import { useSettingsStore } from "@/stores/settings";
import { useTagStore } from "@/stores/tag";

type SlotContextInput = {
  version: MinecraftVersion;
  resources: VersionResourceData | undefined;
  customItems: CustomItem[];
  tags: Tag[];
};

const toByUidMap = <T extends { uid: string }>(values: T[]): Record<string, T> =>
  Object.fromEntries(values.map((value) => [value.uid, value]));

export const createSlotContext = ({
  version,
  resources,
  customItems,
  tags,
}: SlotContextInput): SlotContext => ({
  version,
  resources,
  customItemsByUid: toByUidMap(customItems),
  tagsByUid: toByUidMap(tags),
  allTags: tags,
  vanillaTags: resources?.vanillaTags ?? {},
});

// non-hook variant: snapshot of the current store state
export const getSlotContext = (): SlotContext => {
  const version = useSettingsStore.getState().minecraftVersion;

  return createSlotContext({
    version,
    resources: useResourcesStore.getState()[version],
    customItems: useCustomItemStore.getState().customItems,
    tags: useTagStore.getState().tags,
  });
};
