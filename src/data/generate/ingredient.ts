import { getRawId } from "@/data/models/identifier/utilities";
import { IngredientItem } from "@/data/models/types";

import { FormatStrategy } from "./format/types";
import { EmptyObject, IngredientRef } from "./recipes/types";

export function formatIngredient(
  item: IngredientItem,
  formatter: FormatStrategy,
  includeData?: boolean,
): IngredientRef;
export function formatIngredient(
  item: IngredientItem | undefined,
  formatter: FormatStrategy,
  includeData?: boolean,
): IngredientRef | EmptyObject;
export function formatIngredient(
  item: IngredientItem | undefined,
  formatter: FormatStrategy,
  includeData = true,
): IngredientRef | EmptyObject {
  if (!item) {
    return {};
  }

  return item.type === "tag_item"
    ? formatter.ingredientTag(getRawId(item.id))
    : formatter.ingredient(item.id, includeData);
}

export const formatIngredientString = (item: IngredientItem | undefined) => {
  if (!item) {
    return "";
  }

  return item.type === "tag_item" ? `#${getRawId(item.id)}` : getRawId(item.id);
};
