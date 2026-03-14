import {
  BedrockIngredient,
  EmptyObject,
  ObjectResultRef,
  V112Ingredient,
  V113Ingredient,
  V1212Ingredient,
} from "../recipes/types";

export type FormatIngredient =
  | V112Ingredient
  | V113Ingredient
  | V1212Ingredient
  | BedrockIngredient;

export interface StonecutterResultShape {
  result: ObjectResultRef | string | EmptyObject;
  count?: number;
}

export interface FormatStrategy {
  ingredient: (
    id: {
      raw: string;
      id: string;
      data?: number;
    },
    includeData?: boolean,
  ) => FormatIngredient;
  ingredientTag: (tagId: string) => FormatIngredient;
  objectResult: (
    id: {
      raw: string;
      id: string;
      data?: number;
    },
    count?: number,
  ) => ObjectResultRef;
  stringResult: (id: { raw: string }) => string;
  cookingResult: (
    id: {
      raw: string;
      id: string;
      data?: number;
    },
    count?: number,
  ) => ObjectResultRef | string;
  stonecutterResult: (
    id: {
      raw: string;
      id: string;
      data?: number;
    },
    count?: number,
  ) => StonecutterResultShape;
  recipeType: (baseType: string) => string;
}
