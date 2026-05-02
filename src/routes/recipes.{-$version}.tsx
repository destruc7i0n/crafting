import { createFileRoute, redirect, stripSearchParams } from "@tanstack/react-router";

import { RecipeType, type MinecraftVersion } from "@/data/types";
import {
  isSupportedRecipeCatalogVersion,
  latestRecipeCatalogVersion,
  loadRecipeCatalog,
} from "@/recipes/catalog/load-catalog";
import { recipesSearchDefaults, validateRecipesSearch } from "@/recipes/catalog/routing";
import { getRecipeTypeLabel } from "@/recipes/definitions";

const siteUrl = (import.meta.env.VITE_SITE_URL ?? "https://crafting.thedestruc7i0n.ca").replace(
  /\/$/,
  "",
);
const SEO_RECIPE_TYPES = [
  RecipeType.Crafting,
  RecipeType.Smelting,
  RecipeType.Blasting,
  RecipeType.Smoking,
  RecipeType.CampfireCooking,
  RecipeType.Stonecutter,
  RecipeType.Smithing,
] as const;
const listFormatter = new Intl.ListFormat("en", { style: "long", type: "conjunction" });
const recipeTypes = listFormatter.format(
  SEO_RECIPE_TYPES.map((type) => getRecipeTypeLabel(type).toLocaleLowerCase("en-US")),
);

export const Route = createFileRoute("/recipes/{-$version}")({
  validateSearch: validateRecipesSearch,
  search: {
    middlewares: [stripSearchParams(recipesSearchDefaults)],
  },
  params: {
    parse: (params) => {
      if (!params.version) {
        return { version: undefined };
      }

      if (!isSupportedRecipeCatalogVersion(params.version)) {
        throw new Error("Unsupported recipe catalog version");
      }

      return { version: params.version };
    },
  },
  skipRouteOnParseError: {
    params: true,
  },
  beforeLoad: ({ params, search }) => {
    if (params.version === latestRecipeCatalogVersion) {
      throw redirect({
        to: "/recipes/{-$version}",
        params: { version: undefined },
        search,
        replace: true,
      });
    }
  },
  loader: async ({ params }) => {
    const catalog = await loadRecipeCatalog(getRouteRecipeCatalogVersion(params.version));

    if (!catalog) {
      throw redirect({ to: "/", replace: true });
    }

    return catalog;
  },
  head: ({ params }) => {
    const version = getRouteRecipeCatalogVersion(params.version);
    return getRecipesRouteHead(version, params.version ? `/recipes/${params.version}` : "/recipes");
  },
});

function getRouteRecipeCatalogVersion(version: MinecraftVersion | undefined): MinecraftVersion {
  return version ?? latestRecipeCatalogVersion;
}

function getRecipesRouteHead(version: MinecraftVersion, path: string) {
  const isLatest = version === latestRecipeCatalogVersion;
  const title = `Crafting Recipes List - Minecraft ${version}`;
  const description = `Search and view every Minecraft ${version} ${recipeTypes} recipes.`;
  const url = `${siteUrl}${path}`;

  return {
    links: [{ rel: "canonical", href: isLatest ? `${siteUrl}/recipes` : url }],
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:description", content: description },
      { property: "og:site_name", content: "Crafting Recipe Generator" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      {
        "script:ld+json": {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: title,
          url,
          description,
          isPartOf: {
            "@type": "WebSite",
            name: "Crafting Recipe Generator",
            url: `${siteUrl}/`,
          },
        },
      },
    ],
  };
}
