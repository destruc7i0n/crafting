import { createFileRoute, stripSearchParams } from "@tanstack/react-router";

import { recipesSearchDefaults, validateRecipesSearch } from "@/recipes/catalog/routing";

const siteUrl = (import.meta.env.VITE_SITE_URL ?? "https://crafting.thedestruc7i0n.ca").replace(
  /\/$/,
  "",
);
const title = "Minecraft Crafting Recipes List";
const description =
  "Search supported Minecraft crafting recipes, smelting recipes, stonecutting recipes, and smithing recipes with visual item previews.";

export const Route = createFileRoute("/recipes/")({
  validateSearch: validateRecipesSearch,
  search: {
    middlewares: [stripSearchParams(recipesSearchDefaults)],
  },
  head: () => ({
    links: [{ rel: "canonical", href: `${siteUrl}/recipes` }],
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${siteUrl}/recipes` },
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
          url: `${siteUrl}/recipes`,
          description,
          isPartOf: {
            "@type": "WebSite",
            name: "Crafting Recipe Generator",
            url: `${siteUrl}/`,
          },
        },
      },
    ],
  }),
});
