import { MinecraftVersionSelect } from "@/components/fields/minecraft-version-select";
import { MinecraftVersion } from "@/data/types";
import { trackMinecraftVersionChange } from "@/lib/analytics";
import { useRecipeStore } from "@/stores/recipe";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";
import { useUIStore } from "@/stores/ui";

export const VersionSelector = () => {
  const minecraftVersion = useSettingsStore(selectMinecraftVersion);
  const setMinecraftVersionSetting = useSettingsStore((state) => state.setMinecraftVersion);
  const clearAllSlots = useRecipeStore((state) => state.clearAllSlots);
  const clearInteractionState = useUIStore((state) => state.clearInteractionState);

  const handleVersionChange = (nextVersion: MinecraftVersion) => {
    if (nextVersion === minecraftVersion) {
      return;
    }

    const switchingCrossPlatform =
      (minecraftVersion === MinecraftVersion.Bedrock && nextVersion !== MinecraftVersion.Bedrock) ||
      (minecraftVersion !== MinecraftVersion.Bedrock && nextVersion === MinecraftVersion.Bedrock);

    if (switchingCrossPlatform) {
      const confirmed = confirm(
        "Switching between Java and Bedrock will clear item slots for all recipes. Continue?",
      );

      if (!confirmed) {
        return;
      }

      clearAllSlots();
      clearInteractionState();
    }

    trackMinecraftVersionChange({
      prev_minecraft_version: minecraftVersion,
      minecraft_version: nextVersion,
    });
    setMinecraftVersionSetting(nextVersion);
  };

  return <MinecraftVersionSelect value={minecraftVersion} onChange={handleVersionChange} />;
};
