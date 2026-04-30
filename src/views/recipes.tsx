import {
  type ReactNode,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { getRouteApi } from "@tanstack/react-router";

import { MinecraftVersionSelect } from "@/components/fields/minecraft-version-select";
import { AppShell } from "@/components/layout/app-shell";
import { HeaderNavLink } from "@/components/layout/header";
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

const navLink = <HeaderNavLink to="/">Generator</HeaderNavLink>;

export function RecipesView() {
  const { version: routeVersion } = recipesRoute.useParams();
  const catalog = recipesRoute.useLoaderData();
  const search = recipesRoute.useSearch();
  const navigate = recipesRoute.useNavigate();
  const version = routeVersion ?? latestRecipeCatalogVersion;
  const previousScrollResetKeyRef = useRef(`${version}:${search.recipeType}`);

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

  useEffect(() => {
    const scrollResetKey = `${version}:${search.recipeType}`;

    if (previousScrollResetKeyRef.current === scrollResetKey) {
      return;
    }

    previousScrollResetKeyRef.current = scrollResetKey;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [version, search.recipeType]);

  const recipeTypeOptions = useMemo(() => {
    const presentTypes = new Set(catalog.map((entry) => entry.recipeType));
    return catalogRecipeTypes.filter((recipeType) => presentTypes.has(recipeType));
  }, [catalog]);

  const filteredRecipes = useMemo((): CatalogGridRecipe[] => {
    const nextRecipes: CatalogGridRecipe[] = [];

    for (const entry of catalog) {
      if (search.recipeType !== "all" && entry.recipeType !== search.recipeType) {
        continue;
      }

      if (
        deferredQuery.length > 0 &&
        !getRecipeSearchText(entry, resources).includes(deferredQuery)
      ) {
        continue;
      }

      nextRecipes.push({
        entry,
        title: getRecipeCardTitle(entry, resources),
      });
    }

    return nextRecipes;
  }, [catalog, deferredQuery, resources, search.recipeType]);

  return (
    <AppShell
      title="Crafting Recipes"
      navLink={navLink}
      showHelp={false}
      className="min-h-screen"
      versionSelector={
        <MinecraftVersionSelect
          value={version}
          versions={supportedRecipeCatalogVersions}
          onChange={handleVersionChange}
        />
      }
    >
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
            <RecipeCatalogGrid recipes={filteredRecipes} resources={resources} />
          )}
        </section>
      </main>
    </AppShell>
  );
}

function CatalogEmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="border-border bg-card text-card-foreground rounded-lg border p-6 text-sm">
      {children}
    </div>
  );
}
