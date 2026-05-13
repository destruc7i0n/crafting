import type { ReactNode } from "react";

import { Link, type LinkProps } from "@tanstack/react-router";
import { CircleHelpIcon } from "lucide-react";

import { ResourceIcon } from "@/components/item/resource-icon";
import { RecipeType } from "@/data/types";
import { getRecipeTypeIconItemId } from "@/recipes/definitions";

import { VersionSelector } from "../fields/version-selector";

type HeaderProps = {
  title: string;
  navLink?: ReactNode;
  showHelp?: boolean;
  onHelpClick?: () => void;
  versionSelector?: ReactNode;
};

const defaultVersionSelector = <VersionSelector />;

export function Header({
  title,
  navLink = null,
  showHelp = true,
  onHelpClick,
  versionSelector = defaultVersionSelector,
}: HeaderProps) {
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
    <header className="bg-header text-header-foreground w-full">
      <div className="mx-auto flex w-full max-w-(--app-max-width) items-center justify-between px-2 py-2 md:px-4">
        <div className="flex items-center gap-4">
          <div className="flex min-w-0 items-center gap-2">{brandContent}</div>
          {navLink}
        </div>

        <div className="flex items-center gap-2">
          {showHelp ? (
            <button
              type="button"
              onClick={onHelpClick}
              className="border-header-foreground/20 hover:bg-header-foreground/10 active:bg-header-foreground/15 flex cursor-pointer items-center gap-1 rounded-md border px-2 py-1 text-sm font-medium transition-colors"
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

export function HeaderNavLink({ children, ...props }: LinkProps & { children: ReactNode }) {
  return (
    <Link
      {...props}
      className="text-header-foreground/80 hover:text-header-foreground/60 focus-visible:ring-header-foreground/60 hidden items-center text-sm font-medium transition-colors outline-none focus-visible:rounded-sm focus-visible:ring-2 sm:inline-flex"
    >
      {children}
    </Link>
  );
}
