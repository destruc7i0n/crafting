import { createFileRoute, redirect, stripSearchParams } from "@tanstack/react-router";

import {
  isSupportedRecipeCatalogVersion,
  latestRecipeCatalogVersion,
} from "@/recipes/catalog/load-catalog";
import { recipesSearchDefaults, validateRecipesSearch } from "@/recipes/catalog/routing";

const siteUrl = (import.meta.env.VITE_SITE_URL ?? "https://crafting.thedestruc7i0n.ca").replace(
  /\/$/,
  "",
);
const description =
  "Search supported Minecraft crafting recipes, smelting recipes, stonecutting recipes, and smithing recipes with visual item previews.";

export const Route = createFileRoute("/recipes/$version")({
  validateSearch: validateRecipesSearch,
  search: {
    middlewares: [stripSearchParams(recipesSearchDefaults)],
  },
  params: {
    parse: (params) => {
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
      throw redirect({ to: "/recipes", search, replace: true });
    }
  },
  head: ({ params }) => {
    const title = `Minecraft ${params.version} Crafting Recipes List`;
    const url = `${siteUrl}/recipes/${params.version}`;

    return {
      links: [{ rel: "canonical", href: url }],
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
  },
});
