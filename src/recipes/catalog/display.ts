import { lookupPotion, type PotionCatalog } from "@/data/potions";
import { getRecipeDefinition } from "@/recipes/definitions";

import type { RecipeSlot } from "@/recipes/slots";
import type { VersionResourceData } from "@/stores/resources";

import type {
  CatalogSlotAlternative,
  CatalogSlotValue,
  GeneratedRecipeCatalogEntry,
} from "./types";

type CatalogDisplayContext = { resources?: VersionResourceData; potionCatalog?: PotionCatalog };

export function getRecipeCardTitle(
  entry: GeneratedRecipeCatalogEntry,
  resources?: VersionResourceData,
  potionCatalog?: PotionCatalog,
): string {
  const result = getRecipeResult(entry);

  if (result?.value.kind === "item") {
    return getItemDisplay(result.value.id, result.value.potion, { resources, potionCatalog }).label;
  }

  return getRecipeDefinition(entry.recipeType).label;
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
  potionCatalog?: PotionCatalog,
): string {
  return [
    entry.recipeType,
    getRecipeDefinition(entry.recipeType).label,
    getRecipeCardTitle(entry, resources, potionCatalog),
    ...getRecipeResultSearchParts(entry, resources, potionCatalog),
    ...Object.entries(entry.slots).flatMap(([slot, value]) =>
      getSlotSearchParts(slot as RecipeSlot, value, { resources, potionCatalog }),
    ),
  ]
    .join(" ")
    .toLowerCase();
}

function getRecipeResultSearchParts(
  entry: GeneratedRecipeCatalogEntry,
  resources?: VersionResourceData,
  potionCatalog?: PotionCatalog,
): string[] {
  const result = getRecipeResult(entry);
  if (!result || result.value.kind !== "item") {
    return [];
  }

  const display = getItemDisplay(result.value.id, result.value.potion, {
    resources,
    potionCatalog,
  });
  return [
    result.value.id,
    result.value.potion ?? "",
    display.label,
    ...(display.tooltipLines ?? []),
  ];
}

function getSlotSearchParts(
  slot: RecipeSlot,
  value: CatalogSlotValue | undefined,
  context: CatalogDisplayContext,
): string[] {
  if (!value) {
    return [slot];
  }

  if (value.kind === "alternatives") {
    return [
      slot,
      ...value.values.flatMap((entry) => getAlternativeSearchParts(entry, context.resources)),
    ];
  }

  if (value.kind === "item") {
    const display = getItemDisplay(value.id, value.potion, context);
    return [slot, value.id, value.potion ?? "", display.label, ...(display.tooltipLines ?? [])];
  }

  return [slot, ...getTagSearchParts(value.id, context.resources)];
}

function getAlternativeSearchParts(
  value: CatalogSlotAlternative,
  resources?: VersionResourceData,
): string[] {
  if (value.kind === "item") {
    return [value.id, resources?.itemsById[value.id]?.displayName ?? ""];
  }

  return getTagSearchParts(value.id, resources);
}

function getTagSearchParts(id: string, resources?: VersionResourceData): string[] {
  return [
    id,
    ...(resources?.vanillaTags[id] ?? []).flatMap((itemId) => [
      itemId,
      resources?.itemsById[itemId]?.displayName ?? "",
    ]),
  ];
}

function formatResourceId(id: string): string {
  return id
    .replace(/^minecraft:/, "")
    .split("/")
    .at(-1)!
    .replaceAll("_", " ");
}

export function getItemDisplay(
  id: string,
  potion: string | undefined,
  { resources, potionCatalog }: CatalogDisplayContext,
): { label: string; tooltipLines?: readonly string[] } {
  const item = resources?.itemsById[id];
  if (potion && potionCatalog) {
    const resolved = lookupPotion(potionCatalog, { id, potion });
    if (resolved) return { label: resolved.readable, tooltipLines: resolved.tooltip };
  }
  if (potion) {
    return { label: `${item?.displayName ?? formatResourceId(id)} (${formatResourceId(potion)})` };
  }
  return { label: item?.displayName ?? formatResourceId(id) };
}
