import { MinecraftVersion } from "@/data/types";
import { SingleRecipeState } from "@/stores/recipe";

import {
  NamingContext,
  resolveRecipeNames,
  sanitizeRecipeName,
  toJavaRecipeFileName,
} from "./recipe-name";
import { validateRecipe } from "./validate-recipe";

export interface DatapackRecipeIssue {
  recipe: SingleRecipeState;
  name: string;
  errors: string[];
}

export const getDatapackRecipeFileName = (recipeName: string) => toJavaRecipeFileName(recipeName);

export const validateDatapackExport = (
  recipes: SingleRecipeState[],
  version: MinecraftVersion,
  context: NamingContext,
): DatapackRecipeIssue[] => {
  const resolvedNames = resolveRecipeNames(recipes, context).byId;
  const issues = recipes.map((recipe) => ({
    recipe,
    name: resolvedNames[recipe.id]?.sidebarTitle ?? "Recipe",
    errors: [...validateRecipe(recipe, version).errors],
  }));

  for (const [index, recipe] of recipes.entries()) {
    if (recipe.nameMode === "manual" && sanitizeRecipeName(recipe.name).length === 0) {
      issues[index].errors.push("Add a file name");
    }
  }

  const fileNameToIndexes = new Map<string, number[]>();

  for (const [index, recipe] of recipes.entries()) {
    const javaName = resolvedNames[recipe.id]?.javaName;

    if (!javaName) {
      continue;
    }
    const indexes = fileNameToIndexes.get(javaName) ?? [];
    indexes.push(index);
    fileNameToIndexes.set(javaName, indexes);
  }

  for (const [javaName, indexes] of fileNameToIndexes.entries()) {
    if (indexes.length < 2) {
      continue;
    }

    for (const index of indexes) {
      issues[index].errors.push(`Duplicate filename: ${toJavaRecipeFileName(javaName)}`);
    }
  }

  return issues.filter((issue) => issue.errors.length > 0);
};
