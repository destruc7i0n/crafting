import { MinecraftIdentifier } from "@/data/models/types";

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
  ingredient: (id: MinecraftIdentifier, includeData?: boolean) => FormatIngredient;
  ingredientTag: (tagId: string) => FormatIngredient;
  objectResult: (id: MinecraftIdentifier, count?: number) => ObjectResultRef;
  cookingResult: (id: MinecraftIdentifier, count?: number) => ObjectResultRef | string;
  stonecutterResult: (id: MinecraftIdentifier, count?: number) => StonecutterResultShape;
  recipeType: (baseType: string) => string;
}
