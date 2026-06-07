import { RecipeType } from "./types";

export const cookingRecipeTypes = [
  RecipeType.Smelting,
  RecipeType.Blasting,
  RecipeType.CampfireCooking,
  RecipeType.Smoking,
] as const;

export type CookingRecipeType = (typeof cookingRecipeTypes)[number];

export const isCookingRecipeType = (type: RecipeType): type is CookingRecipeType =>
  (cookingRecipeTypes as readonly RecipeType[]).includes(type);

// default cook time in ticks per type
export const defaultCookingTime: Record<CookingRecipeType, number> = {
  [RecipeType.Smelting]: 200,
  [RecipeType.Blasting]: 100,
  [RecipeType.CampfireCooking]: 100,
  [RecipeType.Smoking]: 100,
};

// null = use default
export const resolveCookingTime = (type: CookingRecipeType, time: number | null): number =>
  time ?? defaultCookingTime[type];
