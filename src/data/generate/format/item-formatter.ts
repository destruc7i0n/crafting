import { MinecraftVersion } from "@/data/types";

import { FormatStrategy } from "./types";
import { compareMinecraftVersions } from "../version-utils";

const hasPositiveCount = (count?: number): count is number =>
  typeof count === "number" && count > 0;

const isAtLeast = (version: MinecraftVersion, minimum: MinecraftVersion) => {
  if (version === MinecraftVersion.Bedrock) {
    return false;
  }

  return compareMinecraftVersions(version, minimum) >= 0;
};

const addMinecraftPrefix = (baseType: string): string => {
  if (baseType.startsWith("minecraft:")) {
    return baseType;
  }

  return `minecraft:${baseType}`;
};

export const createFormatStrategy = (version: MinecraftVersion): FormatStrategy => {
  const useObjectResult =
    version === MinecraftVersion.Bedrock ||
    isAtLeast(version, MinecraftVersion.V121);

  const getObjectResultValue = (identifier: {
    raw: string;
    id: string;
    data?: number;
  }) => {
    if (version === MinecraftVersion.V112) {
      return { item: identifier.id, data: identifier.data };
    }

    if (version === MinecraftVersion.Bedrock) {
      return {
        item: identifier.raw,
        ...(identifier.data !== undefined ? { data: identifier.data } : {}),
      };
    }

    if (isAtLeast(version, MinecraftVersion.V121)) {
      return { id: identifier.raw };
    }

    return { item: identifier.raw };
  };

  return {
    ingredient: (identifier, includeData = true) => {
      if (version === MinecraftVersion.V112) {
        return {
          item: identifier.id,
          data: includeData ? identifier.data : undefined,
        };
      }

      if (version === MinecraftVersion.Bedrock) {
        return {
          item: identifier.raw,
          ...(includeData && identifier.data !== undefined
            ? { data: identifier.data }
            : {}),
        };
      }

      if (isAtLeast(version, MinecraftVersion.V1212)) {
        return identifier.raw;
      }

      return {
        item: identifier.raw,
      };
    },
    ingredientTag: (tagId) => {
      if (version === MinecraftVersion.Bedrock) {
        return { tag: tagId };
      }

      if (version === MinecraftVersion.V112) {
        return {
          item: tagId,
          data: undefined,
        };
      }

      if (isAtLeast(version, MinecraftVersion.V1212)) {
        return `#${tagId}`;
      }

      return { tag: tagId };
    },
    objectResult: (identifier, count) => {
      if (version === MinecraftVersion.Bedrock) {
        return {
          item: identifier.raw,
          ...(identifier.data !== undefined ? { data: identifier.data } : {}),
          ...(hasPositiveCount(count) ? { count } : {}),
        };
      }

      if (version === MinecraftVersion.V112) {
        return {
          item: identifier.id,
          data: identifier.data,
          ...(hasPositiveCount(count) ? { count } : {}),
        };
      }

      if (isAtLeast(version, MinecraftVersion.V121)) {
        return {
          id: identifier.raw,
          ...(hasPositiveCount(count) ? { count } : {}),
        };
      }

      return {
        item: identifier.raw,
        ...(hasPositiveCount(count) ? { count } : {}),
      };
    },
    stringResult: (identifier) => identifier.raw,
    cookingResult: (identifier, count) => {
      if (!useObjectResult) {
        return identifier.raw;
      }

      return {
        ...getObjectResultValue(identifier),
        ...(hasPositiveCount(count) ? { count } : {}),
      };
    },
    stonecutterResult: (identifier, count) => {
      if (!useObjectResult) {
        return {
          result: identifier.raw,
          count: count ?? 1,
        };
      }

      return {
        result: {
          ...getObjectResultValue(identifier),
          ...(hasPositiveCount(count) ? { count } : {}),
        },
      };
    },
    recipeType: (baseType) => {
      if (
        version === MinecraftVersion.V112 ||
        version === MinecraftVersion.V113
      ) {
        return baseType;
      }

      return addMinecraftPrefix(baseType);
    },
  };
};

export const createItemFormatter = createFormatStrategy;
