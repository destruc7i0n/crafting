import { createFileRoute } from "@tanstack/react-router";

import { javaMinecraftVersions } from "@/data/constants";
import { RecipeType } from "@/data/types";
import { getRecipeTypeLabel } from "@/recipes/definitions";
import { CreatorView } from "@/views/creator";

const JAVA_VERSION_GROUP_COUNT = 2;
const SEO_RECIPE_TYPES = [
  RecipeType.Crafting,
  RecipeType.Smelting,
  RecipeType.Blasting,
  RecipeType.Smoking,
  RecipeType.CampfireCooking,
  RecipeType.Stonecutter,
  RecipeType.Smithing,
] as const;

const siteUrl = (import.meta.env.VITE_SITE_URL ?? "https://crafting.thedestruc7i0n.ca").replace(
  /\/$/,
  "",
);
const minecraftVersions = getMinecraftVersions();
const listFormatter = new Intl.ListFormat("en", { style: "long", type: "conjunction" });
const recipeTypes = listFormatter.format(
  SEO_RECIPE_TYPES.map((type) => getRecipeTypeLabel(type).toLocaleLowerCase("en-US")),
);
const title = `Crafting Recipe Generator - ${minecraftVersions}`;
const description = `Crafting recipe generator for ${minecraftVersions}. Create ${recipeTypes} recipes.`;

function getMajorMinorVersion(version: string) {
  const [major, minor] = version.split(".");
  return `${major}.${minor}`;
}

function getMinecraftVersions() {
  const groups = new Set<string>();

  for (const version of javaMinecraftVersions) {
    groups.add(getMajorMinorVersion(version));
    if (groups.size === JAVA_VERSION_GROUP_COUNT) break;
  }

  const [latestJavaVersion, ...otherJavaVersions] = [...groups];
  return [`Minecraft ${latestJavaVersion}`, ...otherJavaVersions, "Bedrock Edition"].join(", ");
}

export const Route = createFileRoute("/")({
  head: () => ({
    links: [{ rel: "canonical", href: `${siteUrl}/` }],
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${siteUrl}/` },
      { property: "og:description", content: description },
      { property: "og:site_name", content: "Crafting Recipe Generator" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      {
        "script:ld+json": {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Crafting Recipe Generator",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Web",
          url: `${siteUrl}/`,
          description,
        },
      },
    ],
  }),
  component: CreatorView,
});
