import { type ReactNode, useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";

import { getRouteApi, Link } from "@tanstack/react-router";

import { MinecraftVersionSelect } from "@/components/fields/minecraft-version-select";
import { Footer } from "@/components/footer";
import { Header } from "@/components/layout/header";
import { CatalogControls } from "@/components/recipes/catalog/catalog-controls";
import {
  RecipeCatalogGrid,
  type CatalogGridRecipe,
} from "@/components/recipes/catalog/recipe-catalog-grid";
import { RecipeType } from "@/data/types";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useResourcesForMinecraftVersion } from "@/hooks/use-resources-for-version";
import { getRecipeCardTitle, getRecipeSearchText } from "@/recipes/catalog/display";
import {
  latestRecipeCatalogVersion,
  supportedRecipeCatalogVersions,
} from "@/recipes/catalog/load-catalog";
import { mergeRecipesSearch } from "@/recipes/catalog/routing";

import type { MinecraftVersion } from "@/data/types";
import type { RecipesSearch } from "@/recipes/catalog/routing";

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

const recipesRoute = getRouteApi("/recipes/{-$version}");

const navLink = (
  <Link
    to="/"
    className="hidden items-center text-sm font-medium text-[hsl(var(--header-fg)/0.82)] transition-colors outline-none hover:text-[hsl(var(--header-fg)/0.62)] focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-white/60 sm:inline-flex"
  >
    Generator
  </Link>
);

export function RecipesView() {
  const { version: routeVersion } = recipesRoute.useParams();
  const catalog = recipesRoute.useLoaderData();
  const search = recipesRoute.useSearch();
  const navigate = recipesRoute.useNavigate();
  const version = routeVersion ?? latestRecipeCatalogVersion;

  const [searchInput, setSearchInput] = useState(search.q);

  const { resources } = useResourcesForMinecraftVersion(version);
  const debouncedSearchInput = useDebouncedValue(searchInput, 200);
  const deferredQuery = useDeferredValue(debouncedSearchInput.trim().toLowerCase());

  const handleSearchChange = useCallback(
    (nextSearch: Partial<RecipesSearch>) => {
      void navigate({
        replace: true,
        search: (previous) => mergeRecipesSearch(previous, nextSearch),
      });
    },
    [navigate],
  );
  const handleVersionChange = useCallback(
    (nextVersion: MinecraftVersion) => {
      void navigate({
        to: "/recipes/{-$version}",
        params: {
          version: nextVersion === latestRecipeCatalogVersion ? undefined : nextVersion,
        },
        search: {
          q: searchInput,
          recipeType: "all",
        },
      });
    },
    [navigate, searchInput],
  );

  useEffect(() => {
    setSearchInput(search.q);
  }, [search.q]);

  useEffect(() => {
    if (debouncedSearchInput !== search.q) {
      handleSearchChange({ q: debouncedSearchInput });
    }
  }, [debouncedSearchInput, handleSearchChange, search.q]);

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
      <Header
        title="Crafting Recipes"
        navLink={navLink}
        showHelp={false}
        versionSelector={
          <MinecraftVersionSelect
            value={version}
            versions={supportedRecipeCatalogVersions}
            onChange={handleVersionChange}
          />
        }
      />
      <main className="flex min-h-0 flex-1 flex-col">
        <CatalogControls
          version={version}
          search={search}
          searchInput={searchInput}
          recipeTypeOptions={recipeTypeOptions}
          onSearchInputChange={setSearchInput}
          onSearchChange={handleSearchChange}
        />

        <section className="mx-auto flex min-h-0 w-full max-w-(--app-max-width) flex-1 flex-col p-2 md:p-4">
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
