import { Select } from "@/components/ui/select";
import { defaultMinecraftVersions } from "@/data/constants";
import { MinecraftVersion } from "@/data/types";
import { useRecipeStore } from "@/stores/recipe";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";
import { useUIStore } from "@/stores/ui";

export const VersionSelector = () => {
  const minecraftVersion = useSettingsStore(selectMinecraftVersion);
  const setMinecraftVersion = useSettingsStore((state) => state.setMinecraftVersion);
  const clearAllSlots = useRecipeStore((state) => state.clearAllSlots);
  const setSelection = useUIStore((state) => state.setSelection);

  const handleVersionChange = (nextVersion: MinecraftVersion) => {
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
      setSelection(undefined);
    }

    setMinecraftVersion(nextVersion);
  };

  const getVersionLabel = (version: MinecraftVersion) => {
    if (version === MinecraftVersion.Bedrock) {
      return "Bedrock";
    }

    return `Java ${version}`;
  };

  return (
    <Select
      wrapperClassName="min-w-[8.5rem]"
      className="border-white/10 bg-white/5 text-[hsl(var(--header-fg))] hover:bg-white/10"
      iconClassName="text-[hsl(var(--header-fg))]/70"
      onChange={(e) => handleVersionChange(e.target.value as MinecraftVersion)}
      value={minecraftVersion}
    >
      {defaultMinecraftVersions.map((version) => (
        <option key={version} value={version}>
          {getVersionLabel(version)}
        </option>
      ))}
    </Select>
  );
};
