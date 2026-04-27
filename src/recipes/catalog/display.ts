import { getRecipeDefinition } from "@/recipes/definitions";

import type { RecipeSlot } from "@/recipes/slots";
import type { VersionResourceData } from "@/stores/resources";

import type {
  CatalogSlotAlternative,
  CatalogSlotValue,
  GeneratedRecipeCatalogEntry,
} from "./types";

export function getRecipeCardTitle(
  entry: GeneratedRecipeCatalogEntry,
  resources?: VersionResourceData,
): string {
  const result = getRecipeResult(entry);

  if (result?.value.kind === "item") {
    return resources?.itemsById[result.value.id]?.displayName ?? formatRecipeId(entry.id);
  }

  return formatRecipeId(entry.id);
}

export function getRecipeResult(
  entry: GeneratedRecipeCatalogEntry,
): { slot: RecipeSlot; value: CatalogSlotValue } | undefined {
  const resultSlot = getRecipeDefinition(entry.recipeType).naming.resultSlot;
  const result = resultSlot ? entry.slots[resultSlot] : undefined;

  return result && resultSlot ? { slot: resultSlot, value: result } : undefined;
}

export function getRecipeSearchText(
  entry: GeneratedRecipeCatalogEntry,
  resources?: VersionResourceData,
): string {
  return [
    entry.id,
    entry.recipeType,
    getRecipeDefinition(entry.recipeType).label,
    getRecipeCardTitle(entry, resources),
    ...getRecipeResultSearchParts(entry, resources),
    ...Object.entries(entry.slots).flatMap(([slot, value]) =>
      getSlotSearchParts(slot as RecipeSlot, value, resources),
    ),
  ]
    .join(" ")
    .toLowerCase();
}

export function getRecipeFileName(entry: GeneratedRecipeCatalogEntry): string {
  return entry.id.replace(/^minecraft:/, "");
}

function getRecipeResultSearchParts(
  entry: GeneratedRecipeCatalogEntry,
  resources?: VersionResourceData,
): string[] {
  const result = getRecipeResult(entry);
  if (!result || result.value.kind !== "item") {
    return [];
  }

  return [result.value.id, resources?.itemsById[result.value.id]?.displayName ?? ""];
}

function getSlotSearchParts(
  slot: RecipeSlot,
  value: CatalogSlotValue | undefined,
  resources?: VersionResourceData,
): string[] {
  if (!value) {
    return [slot];
  }

  if (value.kind === "alternatives") {
    return [slot, ...value.values.flatMap((entry) => getAlternativeSearchParts(entry, resources))];
  }

  if (value.kind === "item") {
    return [slot, value.id, resources?.itemsById[value.id]?.displayName ?? ""];
  }

  return [slot, value.id];
}

function getAlternativeSearchParts(
  value: CatalogSlotAlternative,
  resources?: VersionResourceData,
): string[] {
  if (value.kind === "item") {
    return [value.id, resources?.itemsById[value.id]?.displayName ?? ""];
  }

  return [
    value.id,
    ...(resources?.vanillaTags[value.id] ?? []).flatMap((itemId) => [
      itemId,
      resources?.itemsById[itemId]?.displayName ?? "",
    ]),
  ];
}

function formatRecipeId(id: string): string {
  return id
    .replace(/^minecraft:/, "")
    .split("/")
    .at(-1)!
    .replaceAll("_", " ");
}
