import { MinecraftVersion } from "@/data/types";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";

export const VersionSelector = () => {
  const minecraftVersion = useSettingsStore(selectMinecraftVersion);
  const setMinecraftVersion = useSettingsStore(
    (state) => state.setMinecraftVersion,
  );

  return (
    <select
      className="focus:shadow-outline rounded-md border px-3 py-2 text-sm leading-tight text-gray-700 focus:outline-none"
      onChange={(e) => setMinecraftVersion(e.target.value as MinecraftVersion)}
      value={minecraftVersion}
    >
      {Object.values(MinecraftVersion).map((version) => (
        <option key={version} value={version}>
          {version}
        </option>
      ))}
    </select>
  );
};
