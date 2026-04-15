import { MinecraftVersion } from "@/data/types";
import {
  NamingContext,
  resolveRecipeNames,
  sanitizeRecipeName,
  toJavaRecipeFileName,
} from "@/recipes/naming";
import { validateRecipe } from "@/recipes/validation";
import { Recipe, SlotContext } from "@/stores/recipe/types";

export interface DatapackRecipeIssue {
  recipe: Recipe;
  name: string;
  errors: string[];
}

export const getDatapackRecipeFileName = (recipeName: string) => toJavaRecipeFileName(recipeName);

export const validateDatapackExport = ({
  recipes,
  version,
  context,
  slotContext,
}: {
  recipes: Recipe[];
  version: MinecraftVersion;
  context: NamingContext;
  slotContext: SlotContext;
}): DatapackRecipeIssue[] => {
  const resolvedNames = resolveRecipeNames(recipes, context, slotContext).byId;
  const issues = recipes.map((recipe) => ({
    recipe,
    name: resolvedNames[recipe.id]?.sidebarTitle ?? "Recipe",
    errors: [...validateRecipe(recipe, version, slotContext).errors],
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
