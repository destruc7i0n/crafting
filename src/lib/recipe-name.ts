type RecipeNameLike = {
  recipeName?: string;
};

export const sanitizeRecipeName = (value: string) => value.replace(/[^a-zA-Z0-9_]/g, "");

export const isDuplicateRecipeName = (
  name: string,
  recipes: RecipeNameLike[],
  excludeIndex: number,
) => {
  return recipes.some((recipe, index) => index !== excludeIndex && recipe.recipeName === name);
};
