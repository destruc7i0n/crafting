import { getRawId } from "@/data/models/identifier/utilities";
import { MinecraftIdentifier } from "@/data/models/types";
import { MinecraftVersion } from "@/data/types";
import { toTagRef } from "@/lib/tags";

import { isVersionAtLeast } from "../version-utils";
import { FormatStrategy } from "./types";

const hasPositiveCount = (count?: number): count is number =>
  typeof count === "number" && count > 0;

const addMinecraftPrefix = (baseType: string): string => {
  if (baseType.startsWith("minecraft:")) {
    return baseType;
  }

  return `minecraft:${baseType}`;
};

export const createFormatStrategy = (version: MinecraftVersion): FormatStrategy => {
  const useObjectResult =
    version === MinecraftVersion.Bedrock || isVersionAtLeast(version, MinecraftVersion.V121);

  const getObjectResultValue = (identifier: MinecraftIdentifier) => {
    if (version === MinecraftVersion.V112) {
      // no namespace; always include metadata
      return { item: identifier.id, data: identifier.data };
    }

    if (version === MinecraftVersion.Bedrock) {
      // include metadata when present
      return {
        item: getRawId(identifier),
        ...(identifier.data !== undefined ? { data: identifier.data } : {}),
      };
    }

    if (isVersionAtLeast(version, MinecraftVersion.V121)) {
      // "id" key replaces "item" in 1.21+
      return { id: getRawId(identifier) };
    }

    // Java 1.13–1.20
    return { item: getRawId(identifier) };
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
          item: getRawId(identifier),
          ...(includeData && identifier.data !== undefined ? { data: identifier.data } : {}),
        };
      }

      if (isVersionAtLeast(version, MinecraftVersion.V1212)) {
        return getRawId(identifier);
      }

      // Java 1.13–1.21.1
      return {
        item: getRawId(identifier),
      };
    },
    ingredientTag: (tagId) => {
      if (version === MinecraftVersion.V112) {
        throw new Error("Item tags are not supported in Java 1.12");
      }

      if (isVersionAtLeast(version, MinecraftVersion.V1212)) {
        return toTagRef(tagId);
      }

      // version is Bedrock, or Java 1.13–1.21.1 — both use { tag }
      return { tag: tagId };
    },
    objectResult: (identifier, count) => ({
      ...getObjectResultValue(identifier),
      ...(hasPositiveCount(count) ? { count } : {}),
    }),
    cookingResult: (identifier, count) => {
      if (!useObjectResult) {
        return getRawId(identifier);
      }

      return {
        ...getObjectResultValue(identifier),
        ...(hasPositiveCount(count) ? { count } : {}),
      };
    },
    stonecutterResult: (identifier, count) => {
      if (!useObjectResult) {
        return {
          result: getRawId(identifier),
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
      if (version === MinecraftVersion.V112 || version === MinecraftVersion.V113) {
        // 1.12 and 1.13 use bare type strings without namespace
        return baseType;
      }

      // 1.14+ and Bedrock require the minecraft: prefix
      return addMinecraftPrefix(baseType);
    },
  };
};
