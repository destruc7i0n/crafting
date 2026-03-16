import { getBehaviorPackRecipeFileName } from "@/data/behavior-pack";
import { MinecraftVersion } from "@/data/types";
import { SingleRecipeState } from "@/stores/recipe";

import { bedrockIdentifierHint, isValidBedrockNamespacedIdentifier } from "./minecraft-identifier";
import { validateRecipe } from "./validate-recipe";

export interface BehaviorPackRecipeIssue {
  recipe: SingleRecipeState;
  name: string;
  errors: string[];
}

const getRecipeLabel = (recipe: SingleRecipeState) => {
  return recipe.recipeName?.trim() || "(unnamed)";
};

export const validateBehaviorPackExport = (
  recipes: SingleRecipeState[],
): BehaviorPackRecipeIssue[] => {
  const issues = recipes.map((recipe) => ({
    recipe,
    name: getRecipeLabel(recipe),
    errors: [...validateRecipe(recipe, MinecraftVersion.Bedrock).errors],
  }));

  const identifierToIndexes = new Map<string, number[]>();
  const fileNameToEntries = new Map<string, { indexes: number[]; identifiers: Set<string> }>();

  for (const [index, recipe] of recipes.entries()) {
    const identifier = recipe.bedrock?.identifier?.trim();

    if (!identifier) {
      issues[index].errors.push("Add a Bedrock identifier");
      continue;
    }

    if (!isValidBedrockNamespacedIdentifier(identifier)) {
      issues[index].errors.push(
        `Use a valid Bedrock identifier (namespace:name; ${bedrockIdentifierHint})`,
      );
      continue;
    }

    const indexes = identifierToIndexes.get(identifier) ?? [];
    indexes.push(index);
    identifierToIndexes.set(identifier, indexes);

    const fileName = getBehaviorPackRecipeFileName(identifier);
    const fileNameEntry = fileNameToEntries.get(fileName) ?? {
      indexes: [],
      identifiers: new Set<string>(),
    };
    fileNameEntry.indexes.push(index);
    fileNameEntry.identifiers.add(identifier);
    fileNameToEntries.set(fileName, fileNameEntry);
  }

  for (const [identifier, indexes] of identifierToIndexes.entries()) {
    if (indexes.length < 2) {
      continue;
    }

    for (const index of indexes) {
      issues[index].errors.push(`Duplicate Bedrock identifier: ${identifier}`);
    }
  }

  for (const [fileName, entry] of fileNameToEntries.entries()) {
    if (entry.identifiers.size < 2) {
      continue;
    }

    for (const index of entry.indexes) {
      issues[index].errors.push(`Behavior pack filename collision: ${fileName}`);
    }
  }

  return issues.filter((issue) => issue.errors.length > 0);
};
