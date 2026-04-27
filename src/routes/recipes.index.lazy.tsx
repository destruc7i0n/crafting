import { createLazyFileRoute } from "@tanstack/react-router";

import { RecipesPage } from "@/components/recipes/catalog/recipes-page";
import { latestRecipeCatalogVersion } from "@/recipes/catalog/load-catalog";
import { mergeRecipesSearch } from "@/recipes/catalog/routing";

export const Route = createLazyFileRoute("/recipes/")({
  component: LatestRecipesRoute,
});

function LatestRecipesRoute() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <RecipesPage
      version={latestRecipeCatalogVersion}
      search={search}
      onSearchChange={(nextSearch) => {
        void navigate({
          replace: true,
          search: (previous) => mergeRecipesSearch(previous, nextSearch),
        });
      }}
      onVersionChange={(version, nextSearch) => {
        if (version === latestRecipeCatalogVersion) {
          void navigate({
            to: "/recipes",
            search: nextSearch,
          });
          return;
        }

        void navigate({
          to: "/recipes/$version",
          params: { version },
          search: nextSearch,
        });
      }}
    />
  );
}
