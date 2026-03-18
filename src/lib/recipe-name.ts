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

const firstGap = (matches: (string | undefined)[]): number => {
  const used = new Set(matches.filter(Boolean).map(Number));
  let i = 1;
  while (used.has(i)) i++;
  return i;
};

export const getNextRecipeNumber = (recipes: RecipeNameLike[]): number =>
  firstGap(recipes.map((r) => r.recipeName.match(/^recipe_(\d+)$/)?.[1]));

export const getNextBedrockIdentifierNumber = (
  recipes: Array<{ bedrock: { identifier: string } }>,
  namespace = "crafting",
): number => {
  const pattern = new RegExp(`^${namespace}:recipe_(\\d+)$`);
  return firstGap(recipes.map((r) => r.bedrock.identifier.match(pattern)?.[1]));
};
