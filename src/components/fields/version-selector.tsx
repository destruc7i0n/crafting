import { Select } from "@/components/ui/select";
import { defaultMinecraftVersions } from "@/data/constants";
import { MinecraftVersion } from "@/data/types";
import { coerceRecipeTypeForVersion } from "@/data/versions";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipeType } from "@/stores/recipe/selectors";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";

export const VersionSelector = () => {
  const minecraftVersion = useSettingsStore(selectMinecraftVersion);
  const setMinecraftVersion = useSettingsStore((state) => state.setMinecraftVersion);
  const recipeType = useRecipeStore(selectCurrentRecipeType);
  const setRecipeType = useRecipeStore((state) => state.setRecipeType);
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

    const nextRecipeType = coerceRecipeTypeForVersion(recipeType, nextVersion);

    setMinecraftVersion(nextVersion);

    if (nextRecipeType !== recipeType) {
      setRecipeType(nextRecipeType);
    }
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
