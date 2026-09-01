import { MinecraftVersionSelect } from "@/components/fields/minecraft-version-select";
import { MinecraftVersion } from "@/data/types";
import { applyMinecraftVersionChange, isCrossPlatformVersionSwitch } from "@/lib/editor-actions";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";

export const VersionSelector = () => {
  const minecraftVersion = useSettingsStore(selectMinecraftVersion);

  const handleVersionChange = (nextVersion: MinecraftVersion) => {
    if (isCrossPlatformVersionSwitch(minecraftVersion, nextVersion)) {
      const confirmed = confirm(
        "Switching between Java and Bedrock will clear item slots for all recipes. Continue?",
      );

      if (!confirmed) {
        return;
      }
    }

    applyMinecraftVersionChange(nextVersion);
  };

  return <MinecraftVersionSelect value={minecraftVersion} onChange={handleVersionChange} />;
};
