import { NoTextureTexture } from "@/data/constants";
import {
  compareMinecraftVersions,
  parseStringToMinecraftIdentifier,
} from "@/data/models/identifier/utilities";
import { IngredientItem, Item, Tag, TagItem, TagValue } from "@/data/models/types";
import { MinecraftVersion } from "@/data/types";

import {
  sanitizeJavaIdentifierNamespace,
  sanitizeJavaIdentifierPath,
} from "./minecraft-identifier";

const DEFAULT_TAG_NAME = "custom_tag";
const DEFAULT_TAG_NAMESPACE = "crafting";

const unique = (values: string[]) => [...new Set(values)];

export const getTagNameOrFallback = (value: string) =>
  sanitizeJavaIdentifierPath(value) || DEFAULT_TAG_NAME;

export const getTagNamespaceOrFallback = (value: string) =>
  sanitizeJavaIdentifierNamespace(value) || DEFAULT_TAG_NAMESPACE;

export const getCustomTagIdentifier = (tag: Pick<Tag, "name" | "namespace">) =>
  parseStringToMinecraftIdentifier(`${tag.namespace}:${tag.name}`);

export const getTagLabel = (raw: string) => `#${raw}`;

export const supportsItemTagsForVersion = (version: MinecraftVersion) => {
  if (version === MinecraftVersion.Bedrock) {
    return false;
  }

  return compareMinecraftVersions(version, MinecraftVersion.V113) >= 0;
};

export const createEmptyTag = (existingTags: Tag[]): Tag => {
  const existingNumbers = existingTags
    .map((tag) => tag.name.match(/^custom_tag_(\d+)$/))
    .filter(Boolean)
    .map((match) => Number(match![1]));
  const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

  return {
    uid: globalThis.crypto?.randomUUID?.() ?? `tag-${Math.random().toString(36).slice(2)}`,
    name: `custom_tag_${nextNumber}`,
    namespace: DEFAULT_TAG_NAMESPACE,
    values: [],
  };
};

export const resolveTagValues = (
  values: TagValue[],
  customTags: Tag[],
  vanillaTags: Record<string, string[]>,
): string[] => {
  const customTagsByRawId = new Map(
    customTags.map((tag) => [getCustomTagIdentifier(tag).raw, tag]),
  );
  const seen = new Set<string>();

  const resolveNested = (rawId: string, ancestry: Set<string>): string[] => {
    if (ancestry.has(rawId)) {
      return [];
    }

    const nextAncestry = new Set(ancestry);
    nextAncestry.add(rawId);

    const customTag = customTagsByRawId.get(rawId);
    if (customTag) {
      return resolveValues(customTag.values, nextAncestry);
    }

    return vanillaTags[rawId] ?? [];
  };

  const resolveValues = (tagValues: TagValue[], ancestry = new Set<string>()) => {
    const resolved: string[] = [];

    for (const value of tagValues) {
      if (value.type === "item") {
        resolved.push(value.id.raw);
        continue;
      }

      resolved.push(...resolveNested(value.id.raw, ancestry));
    }

    return resolved;
  };

  return resolveValues(values).filter((value) => {
    if (seen.has(value)) {
      return false;
    }

    seen.add(value);
    return true;
  });
};

const getFirstAvailableTexture = (
  valueIds: string[],
  itemsById: Record<string, Item> | undefined,
): string => {
  if (!itemsById) {
    return NoTextureTexture;
  }

  for (const valueId of valueIds) {
    const item = itemsById[valueId];
    if (item?.texture) {
      return item.texture;
    }
  }

  return NoTextureTexture;
};

type CreateTagItemInput = {
  rawId: string;
  displayName?: string;
  values: string[];
  version: MinecraftVersion;
  itemsById?: Record<string, Item>;
  tagSource: TagItem["tagSource"];
  uid?: string;
};

export const createTagItem = ({
  rawId,
  displayName,
  values,
  version,
  itemsById,
  tagSource,
  uid,
}: CreateTagItemInput): TagItem => {
  const uniqueValues = unique(values);

  return {
    type: "tag_item",
    id: parseStringToMinecraftIdentifier(rawId),
    displayName: displayName ?? getTagLabel(rawId),
    texture: getFirstAvailableTexture(uniqueValues, itemsById),
    _version: version,
    tagSource,
    uid,
    values: uniqueValues,
  };
};

export const isSameIngredient = (
  left: IngredientItem | undefined,
  right: IngredientItem | undefined,
) => {
  if (!left || !right || left.type !== right.type) {
    return false;
  }

  if (left.type === "tag_item" && right.type === "tag_item") {
    return (
      left.tagSource === right.tagSource && left.uid === right.uid && left.id.raw === right.id.raw
    );
  }

  if (left.type === "custom_item" && right.type === "custom_item") {
    return left.uid === right.uid;
  }

  return left.id.raw === right.id.raw;
};
