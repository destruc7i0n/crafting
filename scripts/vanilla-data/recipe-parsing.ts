import type { CatalogSlotAlternative, CatalogSlotValue } from "@/recipes/catalog/types";

type RawRecord = Record<string, unknown>;

export type CatalogResultValue = Extract<CatalogSlotValue, { kind: "item" }>;

export function isRecord(value: unknown): value is RawRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeRecipeType(type: unknown): string | null {
  if (typeof type !== "string") {
    return null;
  }

  return type.startsWith("minecraft:") ? type.slice("minecraft:".length) : type;
}

export function normalizeResourceId(id: string): string {
  if (id.startsWith("#")) {
    return normalizeResourceId(id.slice(1));
  }

  return id.includes(":") ? id : `minecraft:${id}`;
}

export function parseIngredient(value: unknown): CatalogSlotValue | null {
  if (typeof value === "string") {
    return value.startsWith("#")
      ? { kind: "tag", id: normalizeResourceId(value) }
      : { kind: "item", id: normalizeResourceId(value) };
  }

  if (Array.isArray(value)) {
    const values = value
      .map(parseIngredientAlternative)
      .filter((entry): entry is CatalogSlotAlternative => entry !== null);

    if (values.length === 0) {
      return null;
    }

    if (values.length === 1) {
      return values[0];
    }

    return { kind: "alternatives", values };
  }

  return parseIngredientObject(value);
}

export function parseResult(value: unknown, fallbackCount?: unknown): CatalogResultValue | null {
  if (typeof value === "string") {
    return withCount({ kind: "item", id: normalizeResourceId(value) }, fallbackCount);
  }

  if (!isRecord(value)) {
    return null;
  }

  const id = getStringField(value, "id") ?? getStringField(value, "item");
  if (!id) {
    return null;
  }

  return withCount({ kind: "item", id: normalizeResourceId(id) }, value.count ?? fallbackCount);
}

export function getArrayField(record: RawRecord, key: string): unknown[] | undefined {
  const value = record[key];
  return Array.isArray(value) ? value : undefined;
}

export function getRecordField(record: RawRecord, key: string): RawRecord | undefined {
  const value = record[key];
  return isRecord(value) ? value : undefined;
}

function getStringField(record: RawRecord, key: string): string | undefined {
  const value = record[key];
  return typeof value === "string" ? value : undefined;
}

function parseIngredientAlternative(value: unknown): CatalogSlotAlternative | null {
  const ingredient = parseIngredientObject(value) ?? parseIngredient(value);

  if (!ingredient || ingredient.kind === "alternatives") {
    return null;
  }

  return ingredient;
}

function parseIngredientObject(value: unknown): CatalogSlotAlternative | null {
  if (!isRecord(value)) {
    return null;
  }

  const item = getStringField(value, "item") ?? getStringField(value, "id");
  if (item) {
    return { kind: "item", id: normalizeResourceId(item) };
  }

  const tag = getStringField(value, "tag");
  if (tag) {
    return { kind: "tag", id: normalizeResourceId(tag) };
  }

  return null;
}

function withCount(value: CatalogResultValue, rawCount: unknown): CatalogResultValue {
  if (typeof rawCount !== "number" || !Number.isFinite(rawCount) || rawCount <= 1) {
    return value;
  }

  return { ...value, count: rawCount };
}
