import { javaMinecraftVersions } from "@/data/constants";
import { MinecraftVersion, RecipeType } from "@/data/types";

export type RecipeTypeAvailability = {
  minVersion: MinecraftVersion;
  maxVersion?: MinecraftVersion;
  enabled?: boolean;
};

export type PackFormatVersion = number | [number, number];

export type JavaPackMetadata = {
  packFormat: PackFormatVersion;
  recipeDir: "recipe" | "recipes";
  tagDir: "tags/item" | "tags/items";
};

type JavaDatapackVersion = Exclude<(typeof javaMinecraftVersions)[number], MinecraftVersion.V112>;

export function compareMinecraftVersions(a: string, b: string): number {
  const [aMain, aRevision = "0"] = a.split("_");
  const [bMain, bRevision = "0"] = b.split("_");

  const aParts = aMain.split(".").map(Number);
  const bParts = bMain.split(".").map(Number);

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i += 1) {
    const diff = (aParts[i] || 0) - (bParts[i] || 0);

    if (diff > 0) {
      return 1;
    }

    if (diff < 0) {
      return -1;
    }
  }

  const revisionDiff = Number(aRevision) - Number(bRevision);

  if (revisionDiff > 0) {
    return 1;
  }

  if (revisionDiff < 0) {
    return -1;
  }

  return 0;
}

export function isVersionAtLeast(version: MinecraftVersion, minimum: MinecraftVersion): boolean {
  if (version === MinecraftVersion.Bedrock || minimum === MinecraftVersion.Bedrock) {
    return false;
  }

  return compareMinecraftVersions(version, minimum) >= 0;
}

export const recipeTypeAvailability = {
  [RecipeType.Crafting]: { minVersion: MinecraftVersion.V112 },
  [RecipeType.Smelting]: { minVersion: MinecraftVersion.V113 },
  [RecipeType.Blasting]: { minVersion: MinecraftVersion.V114 },
  [RecipeType.CampfireCooking]: { minVersion: MinecraftVersion.V114 },
  [RecipeType.Smoking]: { minVersion: MinecraftVersion.V114 },
  [RecipeType.Stonecutter]: { minVersion: MinecraftVersion.V114 },
  // V119 = 1.19.4, which still uses old smithing
  [RecipeType.Smithing]: {
    minVersion: MinecraftVersion.V116,
    maxVersion: MinecraftVersion.V119,
  },
  [RecipeType.SmithingTransform]: { minVersion: MinecraftVersion.V120 },
  [RecipeType.SmithingTrim]: { minVersion: MinecraftVersion.V120 },
  [RecipeType.CraftingTransmute]: {
    minVersion: MinecraftVersion.V1212,
    enabled: false,
  },
} as const satisfies Record<RecipeType, RecipeTypeAvailability>;

export const getRecipeCategoryOptions = (recipeType: RecipeType): string[] | undefined => {
  switch (recipeType) {
    case RecipeType.Crafting:
    case RecipeType.CraftingTransmute:
      return ["equipment", "building", "misc", "redstone"];
    case RecipeType.Smelting:
      return ["food", "blocks", "misc"];
    case RecipeType.Blasting:
      return ["blocks", "misc"];
    case RecipeType.CampfireCooking:
    case RecipeType.Smoking:
      return ["food"];
    default:
      return undefined;
  }
};

export const supportsRecipeCategory = (
  version: MinecraftVersion,
  recipeType: RecipeType,
): boolean =>
  version !== MinecraftVersion.Bedrock &&
  isVersionAtLeast(version, MinecraftVersion.V119) &&
  getRecipeCategoryOptions(recipeType) !== undefined;

export const supportsShowNotification = (
  version: MinecraftVersion,
  recipeType: RecipeType,
  shapeless: boolean,
): boolean =>
  version !== MinecraftVersion.Bedrock &&
  recipeType === RecipeType.Crafting &&
  isVersionAtLeast(version, shapeless ? MinecraftVersion.V261 : MinecraftVersion.V119);

export const supportsSmithingTrimPattern = (version: MinecraftVersion): boolean =>
  version !== MinecraftVersion.Bedrock && isVersionAtLeast(version, MinecraftVersion.V1215);

export const supportsItemTags = (version: MinecraftVersion): boolean =>
  version === MinecraftVersion.Bedrock || isVersionAtLeast(version, MinecraftVersion.V113);

export const supportsCustomTags = (version: MinecraftVersion): boolean =>
  version !== MinecraftVersion.Bedrock && isVersionAtLeast(version, MinecraftVersion.V113);

export const supportsVanillaTagList = (version: MinecraftVersion): boolean =>
  version === MinecraftVersion.Bedrock || isVersionAtLeast(version, MinecraftVersion.V114);

export const javaPackMetadata = {
  [MinecraftVersion.V113]: {
    packFormat: 4,
    recipeDir: "recipes",
    tagDir: "tags/items",
  },
  [MinecraftVersion.V114]: {
    packFormat: 4,
    recipeDir: "recipes",
    tagDir: "tags/items",
  },
  [MinecraftVersion.V115]: {
    packFormat: 5,
    recipeDir: "recipes",
    tagDir: "tags/items",
  },
  [MinecraftVersion.V116]: {
    packFormat: 6,
    recipeDir: "recipes",
    tagDir: "tags/items",
  },
  [MinecraftVersion.V117]: {
    packFormat: 7,
    recipeDir: "recipes",
    tagDir: "tags/items",
  },
  [MinecraftVersion.V118]: {
    packFormat: 9,
    recipeDir: "recipes",
    tagDir: "tags/items",
  },
  [MinecraftVersion.V119]: {
    packFormat: 12,
    recipeDir: "recipes",
    tagDir: "tags/items",
  },
  [MinecraftVersion.V120]: {
    packFormat: 41,
    recipeDir: "recipes",
    tagDir: "tags/items",
  },
  [MinecraftVersion.V121]: {
    packFormat: 48,
    recipeDir: "recipe",
    tagDir: "tags/item",
  },
  [MinecraftVersion.V1212]: {
    packFormat: 57,
    recipeDir: "recipe",
    tagDir: "tags/item",
  },
  [MinecraftVersion.V1214]: {
    packFormat: 61,
    recipeDir: "recipe",
    tagDir: "tags/item",
  },
  [MinecraftVersion.V1215]: {
    packFormat: 71,
    recipeDir: "recipe",
    tagDir: "tags/item",
  },
  [MinecraftVersion.V1216]: {
    packFormat: 80,
    recipeDir: "recipe",
    tagDir: "tags/item",
  },
  [MinecraftVersion.V1217]: {
    packFormat: 81,
    recipeDir: "recipe",
    tagDir: "tags/item",
  },
  [MinecraftVersion.V1219]: {
    packFormat: [88, 0],
    recipeDir: "recipe",
    tagDir: "tags/item",
  },
  [MinecraftVersion.V12111]: {
    packFormat: [94, 1],
    recipeDir: "recipe",
    tagDir: "tags/item",
  },
  [MinecraftVersion.V261]: {
    packFormat: [101, 1],
    recipeDir: "recipe",
    tagDir: "tags/item",
  },
} as const satisfies Record<JavaDatapackVersion, JavaPackMetadata>;

export const getJavaPackMetadata = (version: MinecraftVersion): JavaPackMetadata => {
  const metadata = javaPackMetadata[version as JavaDatapackVersion];

  if (metadata === undefined) {
    throw new Error(`Datapacks are not supported for ${version}`);
  }

  return metadata;
};
