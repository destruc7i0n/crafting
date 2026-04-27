import { type ReactNode, useDeferredValue, useEffect, useMemo, useState } from "react";

import { Footer } from "@/components/footer";
import { CatalogControls } from "@/components/recipes/catalog/catalog-controls";
import { CatalogHeader } from "@/components/recipes/catalog/catalog-header";
import {
  RecipeCatalogGrid,
  type CatalogGridRecipe,
} from "@/components/recipes/catalog/recipe-catalog-grid";
import { RecipeType } from "@/data/types";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useResourcesForMinecraftVersion } from "@/hooks/use-resources-for-version";
import { getRecipeCardTitle, getRecipeSearchText } from "@/recipes/catalog/display";

import type { MinecraftVersion } from "@/data/types";
import type { RecipesSearch } from "@/recipes/catalog/routing";
import type { GeneratedRecipeCatalog } from "@/recipes/catalog/types";

const catalogRecipeTypes = [
  RecipeType.Crafting,
  RecipeType.Smelting,
  RecipeType.Blasting,
  RecipeType.CampfireCooking,
  RecipeType.Smoking,
  RecipeType.Stonecutter,
  RecipeType.Smithing,
  RecipeType.SmithingTransform,
] as const;

type RecipesPageProps = {
  version: MinecraftVersion;
  catalog: GeneratedRecipeCatalog;
  search: RecipesSearch;
  onSearchChange: (nextSearch: Partial<RecipesSearch>) => void;
  onVersionChange: (version: MinecraftVersion, search: RecipesSearch) => void;
};

export function RecipesPage({
  version,
  catalog,
  search,
  onSearchChange,
  onVersionChange,
}: RecipesPageProps) {
  const [searchInput, setSearchInput] = useState(search.q);
  const { resources } = useResourcesForMinecraftVersion(version);
  const debouncedSearchInput = useDebouncedValue(searchInput, 200);
  const deferredQuery = useDeferredValue(debouncedSearchInput.trim().toLowerCase());
  const currentSearch = useMemo(
    () => ({
      ...search,
      q: searchInput,
    }),
    [search, searchInput],
  );

  useEffect(() => {
    setSearchInput(search.q);
  }, [search.q]);

  useEffect(() => {
    if (debouncedSearchInput !== search.q) {
      onSearchChange({ q: debouncedSearchInput });
    }
  }, [debouncedSearchInput, onSearchChange, search.q]);

  const recipeTypeOptions = useMemo(() => {
    const presentTypes = new Set(catalog.map((entry) => entry.recipeType));
    return catalogRecipeTypes.filter((recipeType) => presentTypes.has(recipeType));
  }, [catalog]);

  const filteredRecipes = useMemo(
    (): CatalogGridRecipe[] =>
      catalog
        .map((entry) => ({
          entry,
          title: getRecipeCardTitle(entry, resources),
          searchText: getRecipeSearchText(entry, resources),
        }))
        .filter(({ entry, searchText }) => {
          const matchesType = search.recipeType === "all" || entry.recipeType === search.recipeType;
          const matchesSearch = deferredQuery.length === 0 || searchText.includes(deferredQuery);

          return matchesType && matchesSearch;
        })
        .map(({ entry, title }) => ({ entry, title })),
    [catalog, deferredQuery, resources, search.recipeType],
  );

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <CatalogHeader
        version={version}
        onVersionChange={(nextVersion) => onVersionChange(nextVersion, currentSearch)}
      />

      <main className="flex min-h-0 flex-1 flex-col">
        <CatalogControls
          version={version}
          search={search}
          searchInput={searchInput}
          recipeTypeOptions={recipeTypeOptions}
          onSearchInputChange={setSearchInput}
          onSearchChange={onSearchChange}
        />

        <section className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4 py-4">
          {filteredRecipes.length === 0 ? (
            <CatalogEmptyState>No recipes match the current search.</CatalogEmptyState>
          ) : (
            <RecipeCatalogGrid
              recipes={filteredRecipes}
              resources={resources}
              scrollResetKey={`${version}:${search.recipeType}`}
            />
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

function CatalogEmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="border-border bg-card text-card-foreground rounded-lg border p-6 text-sm">
      {children}
    </div>
  );
}
