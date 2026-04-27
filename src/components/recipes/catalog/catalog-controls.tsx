import { SearchIcon } from "lucide-react";

import { Select } from "@/components/ui/select";
import { RecipeType } from "@/data/types";
import { getRecipeTypeLabel } from "@/recipes/definitions";

import type { MinecraftVersion } from "@/data/types";
import type { RecipesSearch } from "@/recipes/catalog/routing";

type CatalogControlsProps = {
  version: MinecraftVersion;
  search: RecipesSearch;
  searchInput: string;
  recipeTypeOptions: readonly RecipeType[];
  onSearchInputChange: (value: string) => void;
  onSearchChange: (nextSearch: Partial<RecipesSearch>) => void;
};

export function CatalogControls({
  version,
  search,
  searchInput,
  recipeTypeOptions,
  onSearchInputChange,
  onSearchChange,
}: CatalogControlsProps) {
  return (
    <section className="border-border bg-card/95 supports-[backdrop-filter]:bg-card/85 sticky top-0 z-30 border-b px-4 py-2 backdrop-blur sm:py-3">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 sm:gap-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-normal sm:text-2xl">
              Minecraft {version} Recipes List
            </h1>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_8rem] gap-2 sm:grid-cols-[minmax(220px,1fr)_180px] md:w-[500px]">
            <label className="min-w-0">
              <span className="text-muted-foreground mb-1 hidden text-xs font-medium sm:block">
                Search
              </span>
              <span className="relative block">
                <SearchIcon
                  size={16}
                  className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
                />
                <input
                  aria-label="Search recipes"
                  value={searchInput}
                  onChange={(event) => onSearchInputChange(event.target.value)}
                  placeholder="Search"
                  className="border-input bg-background focus-visible:ring-ring h-10 w-full rounded-md border pr-3 pl-9 text-base outline-none focus-visible:ring-2 sm:text-sm"
                />
              </span>
            </label>

            <label>
              <span className="text-muted-foreground mb-1 hidden text-xs font-medium sm:block">
                Type
              </span>
              <Select
                aria-label="Recipe type"
                value={search.recipeType}
                onChange={(event) =>
                  onSearchChange({
                    recipeType:
                      event.target.value === "all" ? "all" : (event.target.value as RecipeType),
                  })
                }
                wrapperClassName="w-full"
                className="h-10 text-base sm:text-sm"
              >
                <option value="all">All types</option>
                {recipeTypeOptions.map((recipeType) => (
                  <option key={recipeType} value={recipeType}>
                    {getRecipeTypeLabel(recipeType)}
                  </option>
                ))}
              </Select>
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
