import type { ReactNode } from "react";

import { Link } from "@tanstack/react-router";
import { CircleHelpIcon } from "lucide-react";

import { ResourceIcon } from "@/components/item/resource-icon";
import { RecipeType } from "@/data/types";
import { getRecipeTypeIconItemId } from "@/recipes/definitions";
import { useUIStore } from "@/stores/ui";

import { VersionSelector } from "../fields/version-selector";

type HeaderProps = {
  brandTo?: "/";
  navLink?: ReactNode;
  showHelp?: boolean;
  versionSelector?: ReactNode;
};

const defaultRecipesLink = (
  <Link
    to="/recipes/{-$version}"
    params={{ version: undefined }}
    search={{ q: "", recipeType: "all" }}
    className="hidden items-center text-sm font-medium text-[hsl(var(--header-fg)/0.82)] transition-colors outline-none hover:text-[hsl(var(--header-fg)/0.62)] focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-white/60 sm:inline-flex"
  >
    Recipes List
  </Link>
);

const defaultVersionSelector = <VersionSelector />;

export function Header({
  brandTo,
  navLink = defaultRecipesLink,
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
        <span className="hidden sm:inline">Crafting Generator</span>
      </h1>
    </>
  );

  return (
    <header className="flex items-center justify-between bg-[hsl(var(--header-bg))] px-4 py-2 text-[hsl(var(--header-fg))]">
      <div className="flex items-center gap-4">
        {brandTo ? (
          <Link
            to={brandTo}
            className="flex min-w-0 items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            aria-label="Open crafting generator"
          >
            {brandContent}
          </Link>
        ) : (
          <div className="flex min-w-0 items-center gap-2">{brandContent}</div>
        )}
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
    </header>
  );
}
