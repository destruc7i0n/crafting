import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { Footer } from "@/components/footer";
import { CatalogControls } from "@/components/recipes/catalog/catalog-controls";
import { CatalogHeader } from "@/components/recipes/catalog/catalog-header";
import { CatalogResultsState } from "@/components/recipes/catalog/catalog-results-state";
import {
  RecipeCatalogGrid,
  type CatalogGridRecipe,
} from "@/components/recipes/catalog/recipe-catalog-grid";
import { RecipeType } from "@/data/types";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useResourcesForMinecraftVersion } from "@/hooks/use-resources-for-version";
import { getRecipeCardTitle, getRecipeSearchText } from "@/recipes/catalog/display";
import { loadRecipeCatalog } from "@/recipes/catalog/load-catalog";

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
const emptyCatalog: GeneratedRecipeCatalog = [];

type CatalogStatus =
  | { state: "loading"; catalog?: undefined }
  | { state: "loaded"; catalog: GeneratedRecipeCatalog | undefined };

type RecipesPageProps = {
  version: MinecraftVersion;
  search: RecipesSearch;
  onSearchChange: (nextSearch: Partial<RecipesSearch>) => void;
  onVersionChange: (version: MinecraftVersion, search: RecipesSearch) => void;
};

export function RecipesPage({
  version,
  search,
  onSearchChange,
  onVersionChange,
}: RecipesPageProps) {
  const [catalogStatus, setCatalogStatus] = useState<CatalogStatus>({ state: "loading" });
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

  useEffect(() => {
    let active = true;

    setCatalogStatus({ state: "loading" });
    void loadRecipeCatalog(version).then((catalog) => {
      if (active) {
        setCatalogStatus({ state: "loaded", catalog });
      }
    });

    return () => {
      active = false;
    };
  }, [version]);

  const recipes = catalogStatus.catalog ?? emptyCatalog;
  const recipeTypeOptions = useMemo(() => {
    const presentTypes = new Set(recipes.map((entry) => entry.recipeType));
    return catalogRecipeTypes.filter((recipeType) => presentTypes.has(recipeType));
  }, [recipes]);

  const filteredRecipes = useMemo(
    (): CatalogGridRecipe[] =>
      recipes
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
    [deferredQuery, recipes, resources, search.recipeType],
  );

  const noCatalog = catalogStatus.state === "loaded" && catalogStatus.catalog === undefined;
  const noMatches =
    catalogStatus.state === "loaded" &&
    catalogStatus.catalog !== undefined &&
    filteredRecipes.length === 0;
  let emptyMessage: string | undefined;
  if (noCatalog) {
    emptyMessage = "No generated recipe catalog is available for this version.";
  } else if (noMatches) {
    emptyMessage = "No recipes match the current search.";
  }

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

        <section className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4 py-4 lg:px-0">
          <CatalogResultsState
            loading={catalogStatus.state === "loading"}
            hasCatalog={catalogStatus.catalog !== undefined}
            emptyMessage={emptyMessage}
          />

          {filteredRecipes.length > 0 ? (
            <RecipeCatalogGrid
              recipes={filteredRecipes}
              resources={resources}
              scrollResetKey={`${version}:${search.recipeType}`}
            />
          ) : null}
        </section>
      </main>
      <Footer />
    </div>
  );
}
