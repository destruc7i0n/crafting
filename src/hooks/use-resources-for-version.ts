import { MinecraftVersion } from "@/data/types";
import { VersionResourceData, useResourcesStore } from "@/stores/resources";
import { selectResourcesForVersion } from "@/stores/resources/selectors";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";

export const useResourcesForVersion = (): {
  version: MinecraftVersion;
  resources: VersionResourceData | undefined;
} => {
  const minecraftVersion = useSettingsStore(selectMinecraftVersion);
  const resources = useResourcesStore(
    selectResourcesForVersion(minecraftVersion),
  );

  return { version: minecraftVersion, resources };
};
