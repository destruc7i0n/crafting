import { Select } from "@/components/ui/select";
import { defaultMinecraftVersions } from "@/data/constants";
import { getMinecraftVersionLabel } from "@/versioning";

import type { MinecraftVersion } from "@/data/types";

type MinecraftVersionSelectProps = {
  value: MinecraftVersion;
  versions?: readonly MinecraftVersion[];
  onChange: (version: MinecraftVersion) => void;
};

export function MinecraftVersionSelect({
  value,
  versions = defaultMinecraftVersions,
  onChange,
}: MinecraftVersionSelectProps) {
  return (
    <Select
      aria-label="Minecraft version"
      wrapperClassName="min-w-[8.5rem]"
      className="border-primary/55 bg-primary/20 hover:border-primary/70 hover:bg-primary/30 focus:ring-primary/50 dark:border-primary/40 dark:bg-primary/10 dark:hover:border-primary/55 dark:hover:bg-primary/15 dark:focus:ring-primary/35 text-[hsl(var(--header-fg))]"
      iconClassName="text-primary/90 dark:text-primary/75"
      onChange={(event) => onChange(event.target.value as MinecraftVersion)}
      value={value}
    >
      {versions.map((version) => (
        <option key={version} value={version}>
          {getMinecraftVersionLabel(version)}
        </option>
      ))}
    </Select>
  );
}
