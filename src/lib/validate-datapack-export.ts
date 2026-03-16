import { MinecraftVersion } from "@/data/types";
import { SingleRecipeState } from "@/stores/recipe";

import { validateRecipe } from "./validate-recipe";

export interface DatapackRecipeIssue {
  recipe: SingleRecipeState;
  name: string;
  errors: string[];
}

export const getDatapackRecipeFileName = (recipeName: string) => `${recipeName}.json`;

const getRecipeLabel = (recipe: SingleRecipeState) => {
  return recipe.recipeName?.trim() || "(unnamed)";
};

export const validateDatapackExport = (
  recipes: SingleRecipeState[],
  version: MinecraftVersion,
): DatapackRecipeIssue[] => {
  const issues = recipes.map((recipe) => ({
    recipe,
    name: getRecipeLabel(recipe),
    errors: [...validateRecipe(recipe, version).errors],
  }));

  const fileNameToIndexes = new Map<string, number[]>();

  for (const [index, recipe] of recipes.entries()) {
    const recipeName = recipe.recipeName?.trim();

    if (!recipeName) {
      continue;
    }

    const fileName = getDatapackRecipeFileName(recipeName);
    const indexes = fileNameToIndexes.get(fileName) ?? [];
    indexes.push(index);
    fileNameToIndexes.set(fileName, indexes);
  }

  for (const [fileName, indexes] of fileNameToIndexes.entries()) {
    if (indexes.length < 2) {
      continue;
    }

    for (const index of indexes) {
      issues[index].errors.push(`Duplicate datapack filename: ${fileName}`);
    }
  }

  return issues.filter((issue) => issue.errors.length > 0);
};
