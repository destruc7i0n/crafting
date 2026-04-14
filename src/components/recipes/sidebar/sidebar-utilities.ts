import { MinecraftVersion } from "@/data/types";
import { getRecipeExportDetail, toJavaRecipeFileName } from "@/recipes/naming";

import type { RecipeType } from "@/data/types";
import type { RecipeNaming } from "@/recipes/naming";
import type { Recipe } from "@/stores/recipe/types";

interface DownloadConfig {
  label: string;
  readyTitle: string;
  blockedTitle: string;
}

export interface SidebarRecipeRow {
  recipe: Recipe;
  isSelected: boolean;
  isSupported: boolean;
  hasWarning: boolean;
  errors?: string[];
  title: string;
  detail: string;
  downloadTarget?: string;
}

export interface SidebarPackState {
  label: string;
  readyTitle: string;
  blockedTitle: string;
  canDownload: boolean;
  invalidRecipeCountLabel: string;
}

const DOWNLOAD_CONFIG: Record<"bedrock" | "java", DownloadConfig> = {
  bedrock: {
    label: "Download Behavior Pack",
    readyTitle: "Download Behavior Pack",
    blockedTitle: "Fix all recipes before downloading",
  },
  java: {
    label: "Download Datapack",
    readyTitle: "Download Datapack",
    blockedTitle: "Fix all recipes before downloading",
  },
} as const;

export const getRecipeDownloadTarget = (
  version: MinecraftVersion,
  naming: Pick<RecipeNaming, "javaName" | "bedrockIdentifier"> | undefined,
) => {
  if (!naming) {
    return undefined;
  }

  if (version === MinecraftVersion.Bedrock) {
    return naming.bedrockIdentifier;
  }

  if (naming.javaName) {
    return toJavaRecipeFileName(naming.javaName);
  }

  return undefined;
};

export const getSidebarRecipeSummary = (
  naming: RecipeNaming | undefined,
  version: MinecraftVersion,
) => ({
  title: naming?.sidebarTitle ?? "Recipe",
  detail: getRecipeExportDetail(naming, version),
});

export const buildSidebarRecipeRows = ({
  recipes,
  selectedRecipeId,
  resolvedNamesById,
  version,
  supportedRecipeTypes,
  invalidRecipesById,
}: {
  recipes: Recipe[];
  selectedRecipeId: string;
  resolvedNamesById: Record<string, RecipeNaming | undefined>;
  version: MinecraftVersion;
  supportedRecipeTypes: readonly RecipeType[];
  invalidRecipesById: ReadonlyMap<string, string[]>;
}): SidebarRecipeRow[] => {
  const supportedRecipeTypeSet = new Set(supportedRecipeTypes);

  return recipes.map((recipe) => {
    const naming = resolvedNamesById[recipe.id];
    const errors = invalidRecipesById.get(recipe.id);
    const { title, detail } = getSidebarRecipeSummary(naming, version);
    const isSupported = supportedRecipeTypeSet.has(recipe.recipeType);
    const hasErrors = (errors?.length ?? 0) > 0;

    return {
      recipe,
      isSelected: selectedRecipeId === recipe.id,
      isSupported,
      hasWarning: !isSupported || hasErrors,
      errors,
      title,
      detail,
      downloadTarget: getRecipeDownloadTarget(version, naming),
    };
  });
};

export const buildSidebarPackState = (
  version: MinecraftVersion,
  invalidRecipeCount: number,
): SidebarPackState => {
  const config = DOWNLOAD_CONFIG[version === MinecraftVersion.Bedrock ? "bedrock" : "java"];

  return {
    ...config,
    canDownload: invalidRecipeCount === 0,
    invalidRecipeCountLabel: `${invalidRecipeCount} invalid ${invalidRecipeCount === 1 ? "recipe" : "recipes"}`,
  };
};
