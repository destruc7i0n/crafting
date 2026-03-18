type RecipeNameLike = {
  recipeName: string;
};

export const sanitizeRecipeName = (value: string) => value.replace(/[^a-zA-Z0-9_]/g, "");

export const getRecipeLabel = (recipe: RecipeNameLike) => recipe.recipeName.trim() || "(unnamed)";

export const isDuplicateRecipeName = (
  name: string,
  recipes: RecipeNameLike[],
  excludeIndex: number,
) => {
  return recipes.some((recipe, index) => index !== excludeIndex && recipe.recipeName === name);
};

export const getNextRecipeNumber = (recipes: RecipeNameLike[]): number => {
  const existingNumbers = recipes
    .map((r) => r.recipeName.match(/^recipe_(\d+)$/)?.[1])
    .filter(Boolean)
    .map(Number);
  return existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
};

export const getNextBedrockIdentifierNumber = (
  recipes: Array<{ bedrock: { identifier: string } }>,
  namespace = "crafting",
): number => {
  const pattern = new RegExp(`^${namespace}:recipe_(\\d+)$`);
  const existingNumbers = recipes
    .map((r) => r.bedrock.identifier.match(pattern)?.[1])
    .filter(Boolean)
    .map(Number);
  return existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
};
