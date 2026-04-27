import { RecipeType } from "@/data/types";
import { getRecipeDefinition } from "@/recipes/definitions";

import type { GeneratedRecipeCatalogEntry } from "@/recipes/catalog/types";

import type { ItemGroupOrder } from "./item-group-order";

const missingItemOrder = Number.MAX_SAFE_INTEGER;

export const catalogRecipeTypeOrder = {
  [RecipeType.Crafting]: 0,
  [RecipeType.Smelting]: 1,
  [RecipeType.Blasting]: 2,
  [RecipeType.Smoking]: 3,
  [RecipeType.CampfireCooking]: 4,
  [RecipeType.Smithing]: 5,
  [RecipeType.SmithingTransform]: 6,
  [RecipeType.SmithingTrim]: 7,
  [RecipeType.Stonecutter]: 8,
  [RecipeType.CraftingTransmute]: 9,
} satisfies Record<RecipeType, number>;

export function compareRecipeCatalogEntries(
  itemGroupOrder: ItemGroupOrder,
  left: GeneratedRecipeCatalogEntry,
  right: GeneratedRecipeCatalogEntry,
): number {
  return (
    getCatalogEntryOutputOrder(itemGroupOrder, left) -
      getCatalogEntryOutputOrder(itemGroupOrder, right) ||
    catalogRecipeTypeOrder[left.recipeType] - catalogRecipeTypeOrder[right.recipeType] ||
    left.id.localeCompare(right.id)
  );
}

function getCatalogEntryOutputOrder(
  itemGroupOrder: ItemGroupOrder,
  entry: GeneratedRecipeCatalogEntry,
): number {
  const resultSlot = getRecipeDefinition(entry.recipeType).naming.resultSlot;
  const result = resultSlot ? entry.slots[resultSlot] : undefined;

  if (result?.kind !== "item") {
    return missingItemOrder;
  }

  return itemGroupOrder.get(result.id) ?? missingItemOrder;
}
