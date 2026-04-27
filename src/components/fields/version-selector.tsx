import { Select } from "@/components/ui/select";
import { defaultMinecraftVersions } from "@/data/constants";
import { MinecraftVersion } from "@/data/types";
import { trackMinecraftVersionChange } from "@/lib/analytics";
import { useRecipeStore } from "@/stores/recipe";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";
import { useUIStore } from "@/stores/ui";
import { getMinecraftVersionLabel } from "@/versioning";

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

  return (
    <Select
      aria-label="Minecraft version"
      wrapperClassName="min-w-[8.5rem]"
      className="border-primary/55 bg-primary/20 hover:border-primary/70 hover:bg-primary/30 focus:ring-primary/50 dark:border-primary/40 dark:bg-primary/10 dark:hover:border-primary/55 dark:hover:bg-primary/15 dark:focus:ring-primary/35 text-[hsl(var(--header-fg))]"
      iconClassName="text-primary/90 dark:text-primary/75"
      onChange={(e) => handleVersionChange(e.target.value as MinecraftVersion)}
      value={minecraftVersion}
    >
      {defaultMinecraftVersions.map((version) => (
        <option key={version} value={version}>
          {getMinecraftVersionLabel(version)}
        </option>
      ))}
    </Select>
  );
};
