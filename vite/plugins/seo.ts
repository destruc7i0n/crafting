import { versions as minecraftTextureVersions } from "minecraft-textures";

import type { Plugin } from "vite";

const TITLE_PLACEHOLDER = "%TITLE%";
const DESCRIPTION_PLACEHOLDER = "%DESCRIPTION%";
const CANONICAL_URL_PLACEHOLDER = "%CANONICAL_URL%";
const JSON_LD_PLACEHOLDER = "%JSON_LD%";
const JAVA_VERSION_GROUP_COUNT = 2;
const DEFAULT_SITE_URL = "https://crafting.thedestruc7i0n.ca";

const RECIPE_TYPES = [
  "crafting",
  "smelting",
  "blasting",
  "smoking",
  "campfire cooking",
  "stonecutting",
  "smithing",
] as const;

const javaMinecraftVersions = [...minecraftTextureVersions].reverse();

const getMajorMinorVersion = (version: string) => {
  const [major, minor] = version.split(".");
  return `${major}.${minor}`;
};

const getMinecraftVersions = () => {
  const groups = new Set<string>();

  for (const version of javaMinecraftVersions) {
    groups.add(getMajorMinorVersion(version));
    if (groups.size === JAVA_VERSION_GROUP_COUNT) break;
  }

  const [latestJavaVersion, ...otherJavaVersions] = [...groups];
  return [`Minecraft ${latestJavaVersion}`, ...otherJavaVersions, "Bedrock Edition"].join(", ");
};

export const seo = (): Plugin => {
  const versions = getMinecraftVersions();
  const siteUrl = (process.env.VITE_SITE_URL ?? DEFAULT_SITE_URL).replace(/\/$/, "");

  const listFormatter = new Intl.ListFormat("en", { style: "long", type: "conjunction" });
  const recipeTypes = listFormatter.format(RECIPE_TYPES);
  const homeMetadata = {
    path: "/",
    title: `Crafting Recipe Generator - ${versions}`,
    description: `Crafting recipe generator for ${versions}. Create ${recipeTypes} recipes.`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Crafting Recipe Generator",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web",
      url: `${siteUrl}/`,
      description: `Crafting recipe generator for ${versions}. Create ${recipeTypes} recipes.`,
    },
  };

  return {
    name: "seo",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        return renderRouteHtml(html, homeMetadata, siteUrl);
      },
    },
  };
};

type RouteMetadata = {
  path: string;
  title: string;
  description: string;
  jsonLd: Record<string, unknown>;
};

function renderRouteHtml(html: string, metadata: RouteMetadata, siteUrl: string): string {
  const canonicalUrl = `${siteUrl}${metadata.path}`;

  return html
    .replaceAll(TITLE_PLACEHOLDER, metadata.title)
    .replaceAll(DESCRIPTION_PLACEHOLDER, metadata.description)
    .replaceAll(CANONICAL_URL_PLACEHOLDER, canonicalUrl)
    .replaceAll(JSON_LD_PLACEHOLDER, JSON.stringify(metadata.jsonLd));
}
