import { ResourceIcon } from "@/components/item/resource-icon";
import { recipeTypeToItemId } from "@/data/constants";
import { RecipeType } from "@/data/types";

import { VersionSelector } from "../fields/version-selector";

export function Header() {
  return (
    <header className="flex items-center justify-between bg-[hsl(var(--header-bg))] px-4 py-2 text-[hsl(var(--header-fg))]">
      <div className="flex items-center gap-2">
        <ResourceIcon
          itemId={recipeTypeToItemId[RecipeType.Crafting]}
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
        <VersionSelector />
      </div>
    </header>
  );
}
