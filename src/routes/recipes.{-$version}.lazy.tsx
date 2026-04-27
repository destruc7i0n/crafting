import { createLazyFileRoute } from "@tanstack/react-router";

import { RecipesPage } from "@/components/recipes/catalog/recipes-page";
import { latestRecipeCatalogVersion } from "@/recipes/catalog/load-catalog";
import { mergeRecipesSearch } from "@/recipes/catalog/routing";

export const Route = createLazyFileRoute("/recipes/{-$version}")({
  component: RecipesRoute,
});

function RecipesRoute() {
  const { version: routeVersion } = Route.useParams();
  const catalog = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const version = routeVersion ?? latestRecipeCatalogVersion;

  return (
    <RecipesPage
      version={version}
      catalog={catalog}
      search={search}
      onSearchChange={(nextSearch) => {
        void navigate({
          replace: true,
          search: (previous) => mergeRecipesSearch(previous, nextSearch),
        });
      }}
      onVersionChange={(nextVersion, nextSearch) => {
        void navigate({
          to: "/recipes/{-$version}",
          params: {
            version: nextVersion === latestRecipeCatalogVersion ? undefined : nextVersion,
          },
          search: nextSearch,
        });
      }}
    />
  );
}
