import { CircleHelpIcon } from "lucide-react";

import { ResourceIcon } from "@/components/item/resource-icon";
import { RecipeType } from "@/data/types";
import { getRecipeTypeIconItemId } from "@/recipes/definitions";
import { useUIStore } from "@/stores/ui";

import { VersionSelector } from "../fields/version-selector";

export function Header() {
  const openHelpDialog = useUIStore((state) => state.openHelpDialog);

  return (
    <header className="flex items-center justify-between bg-[hsl(var(--header-bg))] px-4 py-2 text-[hsl(var(--header-fg))]">
      <div className="flex items-center gap-2">
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
      </div>

      <div className="flex items-center gap-2">
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
        <VersionSelector />
      </div>
    </header>
  );
}
