import { useEffect } from "react";

import { MinecraftVersion } from "@/data/types";
import { VersionResourceData, useResourcesStore } from "@/stores/resources";
import { loadResources } from "@/stores/resources/loader";
import { selectResourcesForVersion } from "@/stores/resources/selectors";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";

export const useResourcesForVersion = (): {
  version: MinecraftVersion;
  resources: VersionResourceData | undefined;
} => {
  const minecraftVersion = useSettingsStore(selectMinecraftVersion);

  return useResourcesForMinecraftVersion(minecraftVersion);
};

export const useResourcesForMinecraftVersion = (
  minecraftVersion: MinecraftVersion,
): {
  version: MinecraftVersion;
  resources: VersionResourceData | undefined;
} => {
  const resources = useResourcesStore(selectResourcesForVersion(minecraftVersion));

  useEffect(() => {
    loadResources(minecraftVersion);
  }, [minecraftVersion]);

  return { version: minecraftVersion, resources };
};
