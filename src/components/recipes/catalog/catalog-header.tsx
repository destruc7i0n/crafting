import { MinecraftVersionSelect } from "@/components/fields/minecraft-version-select";
import { Header } from "@/components/layout/header";
import { supportedRecipeCatalogVersions } from "@/recipes/catalog/load-catalog";

import type { MinecraftVersion } from "@/data/types";

type CatalogHeaderProps = {
  version: MinecraftVersion;
  onVersionChange: (version: MinecraftVersion) => void;
};

export function CatalogHeader({ version, onVersionChange }: CatalogHeaderProps) {
  return (
    <Header
      brandTo="/"
      navLink={null}
      showHelp={false}
      versionSelector={
        <MinecraftVersionSelect
          value={version}
          versions={supportedRecipeCatalogVersions}
          onChange={onVersionChange}
        />
      }
    />
  );
}
