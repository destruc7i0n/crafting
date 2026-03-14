import { MinecraftVersion } from "@/data/types";
import { useRecipeStore } from "@/stores/recipe";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";

export const VersionSelector = () => {
  const minecraftVersion = useSettingsStore(selectMinecraftVersion);
  const setMinecraftVersion = useSettingsStore((state) => state.setMinecraftVersion);
  const clearAllSlots = useRecipeStore((state) => state.clearAllSlots);

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
    <select
      className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm leading-tight text-[hsl(var(--header-fg))] outline-none transition-colors hover:bg-white/10 focus:ring-2 focus:ring-white/20"
      onChange={(e) => handleVersionChange(e.target.value as MinecraftVersion)}
      value={minecraftVersion}
    >
      {Object.values(MinecraftVersion).map((version) => (
        <option key={version} value={version}>
          {getVersionLabel(version)}
        </option>
      ))}
    </select>
  );
};
