import { createLazyFileRoute } from "@tanstack/react-router";

import { RecipesPage } from "@/components/recipes/catalog/recipes-page";
import { latestRecipeCatalogVersion } from "@/recipes/catalog/load-catalog";
import { mergeRecipesSearch } from "@/recipes/catalog/routing";

export const Route = createLazyFileRoute("/recipes/$version")({
  component: VersionedRecipesRoute,
});

function VersionedRecipesRoute() {
  const { version } = Route.useParams();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <RecipesPage
      version={version}
      search={search}
      onSearchChange={(nextSearch) => {
        void navigate({
          replace: true,
          search: (previous) => mergeRecipesSearch(previous, nextSearch),
        });
      }}
      onVersionChange={(nextVersion, nextSearch) => {
        if (nextVersion === latestRecipeCatalogVersion) {
          void navigate({
            to: "/recipes",
            search: nextSearch,
          });
          return;
        }

        void navigate({
          to: "/recipes/$version",
          params: { version: nextVersion },
          search: nextSearch,
        });
      }}
    />
  );
}
