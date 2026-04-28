import type { ReactNode } from "react";

import { CircleHelpIcon } from "lucide-react";

import { ResourceIcon } from "@/components/item/resource-icon";
import { RecipeType } from "@/data/types";
import { getRecipeTypeIconItemId } from "@/recipes/definitions";
import { useUIStore } from "@/stores/ui";

import { VersionSelector } from "../fields/version-selector";

type HeaderProps = {
  title: string;
  navLink?: ReactNode;
  showHelp?: boolean;
  versionSelector?: ReactNode;
};

const defaultVersionSelector = <VersionSelector />;

export function Header({
  title,
  navLink = null,
  showHelp = true,
  versionSelector = defaultVersionSelector,
}: HeaderProps) {
  const openHelpDialog = useUIStore((state) => state.openHelpDialog);
  const brandContent = (
    <>
      <ResourceIcon
        itemId={getRecipeTypeIconItemId(RecipeType.Crafting)}
        alt="Crafting table"
        className="pointer-events-none h-8 w-8 [image-rendering:crisp-edges] [image-rendering:pixelated]"
        draggable={false}
      />
      <h1 className="text-lg font-bold">
        <span className="sm:hidden">Crafting</span>
        <span className="hidden sm:inline">{title}</span>
      </h1>
    </>
  );

  return (
    <header className="w-full bg-[hsl(var(--header-bg))] text-[hsl(var(--header-fg))]">
      <div className="mx-auto flex w-full max-w-(--app-max-width) items-center justify-between px-4 py-2">
        <div className="flex items-center gap-4">
          <div className="flex min-w-0 items-center gap-2">{brandContent}</div>
          {navLink}
        </div>

        <div className="flex items-center gap-2">
          {showHelp ? (
            <button
              type="button"
              onClick={openHelpDialog}
              className="flex cursor-pointer items-center gap-1 rounded-md border border-white/20 px-2 py-1 text-sm font-medium transition-colors hover:bg-white/10 active:bg-white/15"
              aria-label="Show help"
              title="Show help"
            >
              <CircleHelpIcon size={16} />
              <span className="hidden sm:inline">Help</span>
            </button>
          ) : null}
          {versionSelector}
        </div>
      </div>
    </header>
  );
}
