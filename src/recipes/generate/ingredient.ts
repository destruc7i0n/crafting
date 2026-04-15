import { getRawId } from "@/data/models/identifier/utilities";
import { MinecraftVersion } from "@/data/types";
import { toTagRef } from "@/lib/tags";
import { createEmptySlotContext } from "@/stores/recipe/slot-value";
import { getRequiredSlotIdentifier, isTagSlotValue } from "@/stores/recipe/slot-value";
import { RecipeSlotValue, SlotContext } from "@/stores/recipe/types";

import { RecipeFormatter } from "./format/types";
import { EmptyObject, IngredientRef } from "./types";

export function formatIngredient({
  item,
  formatter,
  slotContext,
  includeData,
}: {
  item: RecipeSlotValue;
  formatter: RecipeFormatter;
  slotContext?: SlotContext;
  includeData?: boolean;
}): IngredientRef;
export function formatIngredient({
  item,
  formatter,
  slotContext,
  includeData,
}: {
  item: RecipeSlotValue | undefined;
  formatter: RecipeFormatter;
  slotContext?: SlotContext;
  includeData?: boolean;
}): IngredientRef | EmptyObject;
export function formatIngredient({
  item,
  formatter,
  slotContext = createEmptySlotContext(MinecraftVersion.V121),
  includeData = true,
}: {
  item: RecipeSlotValue | undefined;
  formatter: RecipeFormatter;
  slotContext?: SlotContext;
  includeData?: boolean;
}): IngredientRef | EmptyObject {
  if (!item) {
    return {};
  }

  const identifier = getRequiredSlotIdentifier(item, slotContext);

  return isTagSlotValue(item)
    ? formatter.ingredientTag(getRawId(identifier))
    : formatter.ingredient(identifier, includeData);
}

export const formatIngredientString = (
  item: RecipeSlotValue | undefined,
  slotContext = createEmptySlotContext(MinecraftVersion.V121),
) => {
  if (!item) {
    return "";
  }

  const identifier = getRequiredSlotIdentifier(item, slotContext);

  return isTagSlotValue(item) ? toTagRef(getRawId(identifier)) : getRawId(identifier);
};
