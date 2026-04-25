import { versions as minecraftTextureVersions } from "minecraft-textures";

import type { Plugin } from "vite";

const TITLE_PLACEHOLDER = "%TITLE%";
const DESCRIPTION_PLACEHOLDER = "%DESCRIPTION%";
const JAVA_VERSION_GROUP_COUNT = 2;

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

  const listFormatter = new Intl.ListFormat("en", { style: "long", type: "conjunction" });
  const recipeTypes = listFormatter.format(RECIPE_TYPES);

  return {
    name: "seo",
    transformIndexHtml(html) {
      return html
        .replaceAll(TITLE_PLACEHOLDER, `Crafting Recipe Generator - ${versions}`)
        .replaceAll(
          DESCRIPTION_PLACEHOLDER,
          `Crafting recipe generator for ${versions}. Create ${recipeTypes} recipes.`,
        );
    },
  };
};
