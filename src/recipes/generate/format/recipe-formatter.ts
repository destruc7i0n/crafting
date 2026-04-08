import { getRawId } from "@/data/models/identifier/utilities";
import { MinecraftVersion } from "@/data/types";
import { toTagRef } from "@/lib/tags";

import { compareMinecraftVersions, isVersionAtLeast } from "../../versioning";
import { ObjectResultRef } from "../types";
import { RecipeFormatter } from "./types";

type FormatterRange = {
  from: MinecraftVersion;
  to?: MinecraftVersion;
  formatter: RecipeFormatter;
};

const hasPositiveCount = (count?: number): count is number =>
  typeof count === "number" && count > 0;

const withCount = <T extends ObjectResultRef>(
  value: T,
  count?: number,
): T | (T & { count: number }) => (hasPositiveCount(count) ? { ...value, count } : value);

const bareRecipeType = (baseType: string): string => baseType;

const namespacedRecipeType = (baseType: string): string =>
  baseType.startsWith("minecraft:") ? baseType : `minecraft:${baseType}`;

export const javaV112RecipeFormatter: RecipeFormatter = {
  ingredient: (identifier, includeData = true) => ({
    item: getRawId(identifier),
    data: includeData ? identifier.data : undefined,
  }),
  ingredientTag: () => {
    throw new Error("Item tags are not supported in Java 1.12");
  },
  objectResult: (identifier, count) =>
    withCount(
      {
        item: getRawId(identifier),
        data: identifier.data,
      },
      count,
    ),
  cookingResult: (identifier) => getRawId(identifier),
  stonecutterResult: (identifier, count) => ({
    result: getRawId(identifier),
    count: count ?? 1,
  }),
  recipeType: bareRecipeType,
};

export const javaV113RecipeFormatter: RecipeFormatter = {
  ingredient: (identifier) => ({ item: getRawId(identifier) }),
  ingredientTag: (tagId) => ({ tag: tagId }),
  objectResult: (identifier, count) => withCount({ item: getRawId(identifier) }, count),
  cookingResult: (identifier) => getRawId(identifier),
  stonecutterResult: (identifier, count) => ({
    result: getRawId(identifier),
    count: count ?? 1,
  }),
  recipeType: bareRecipeType,
};

export const javaV114RecipeFormatter: RecipeFormatter = {
  ...javaV113RecipeFormatter,
  recipeType: namespacedRecipeType,
};

export const javaV121RecipeFormatter: RecipeFormatter = {
  ...javaV114RecipeFormatter,
  objectResult: (identifier, count) => withCount({ id: getRawId(identifier) }, count),
  cookingResult: (identifier, count) => withCount({ id: getRawId(identifier) }, count),
  stonecutterResult: (identifier, count) => ({
    result: withCount({ id: getRawId(identifier) }, count),
  }),
};

export const javaV1212RecipeFormatter: RecipeFormatter = {
  ...javaV121RecipeFormatter,
  ingredient: (identifier) => getRawId(identifier),
  ingredientTag: (tagId) => toTagRef(tagId),
};

export const bedrockRecipeFormatter: RecipeFormatter = {
  ingredient: (identifier, includeData = true) => ({
    item: getRawId(identifier),
    ...(includeData && identifier.data !== undefined ? { data: identifier.data } : {}),
  }),
  ingredientTag: (tagId) => ({ tag: tagId }),
  objectResult: (identifier, count) =>
    withCount(
      {
        item: getRawId(identifier),
        ...(identifier.data !== undefined ? { data: identifier.data } : {}),
      },
      count,
    ),
  cookingResult: (identifier, count) =>
    withCount(
      {
        item: getRawId(identifier),
        ...(identifier.data !== undefined ? { data: identifier.data } : {}),
      },
      count,
    ),
  stonecutterResult: (identifier, count) => ({
    result: withCount(
      {
        item: getRawId(identifier),
        ...(identifier.data !== undefined ? { data: identifier.data } : {}),
      },
      count,
    ),
  }),
  recipeType: namespacedRecipeType,
};

const JAVA_FORMATTER_RANGES: FormatterRange[] = [
  { from: MinecraftVersion.V112, to: MinecraftVersion.V112, formatter: javaV112RecipeFormatter },
  { from: MinecraftVersion.V113, to: MinecraftVersion.V113, formatter: javaV113RecipeFormatter },
  { from: MinecraftVersion.V114, to: MinecraftVersion.V120, formatter: javaV114RecipeFormatter },
  { from: MinecraftVersion.V121, to: MinecraftVersion.V121, formatter: javaV121RecipeFormatter },
  { from: MinecraftVersion.V1212, formatter: javaV1212RecipeFormatter },
];

const isInRange = (
  version: MinecraftVersion,
  range: Omit<FormatterRange, "formatter">,
): boolean => {
  if (!isVersionAtLeast(version, range.from)) {
    return false;
  }

  if (!range.to) {
    return true;
  }

  return compareMinecraftVersions(version, range.to) <= 0;
};

export const createRecipeFormatter = (version: MinecraftVersion): RecipeFormatter => {
  if (version === MinecraftVersion.Bedrock) {
    return bedrockRecipeFormatter;
  }

  const match = JAVA_FORMATTER_RANGES.find((range) => isInRange(version, range));

  if (!match) {
    throw new Error(`No recipe formatter for version: ${version}`);
  }

  return match.formatter;
};
