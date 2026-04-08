import { NoTextureTexture } from "@/data/constants";
import {
  getRawId,
  identifierUniqueKey,
  parseStringToMinecraftIdentifier,
} from "@/data/models/identifier/utilities";
import { IngredientItem, Item, Tag, TagItem, TagValue } from "@/data/models/types";
import { MinecraftVersion } from "@/data/types";
import { generateUid } from "@/lib/utils";
import { isVersionAtLeast } from "@/recipes/versioning";

const DEFAULT_TAG_NAME = "custom_tag";
const DEFAULT_TAG_NAMESPACE = "crafting";

const unique = (values: string[]) => [...new Set(values)];

export const getCustomTagIdentifier = (tag: Pick<Tag, "id">) =>
  parseStringToMinecraftIdentifier(tag.id);

export const getTagLabel = (raw: string) => toTagRef(raw);

export const toTagRef = (rawId: string): string => `#${rawId}`;
const fromTagRef = (ref: string): string => ref.slice(1);

export type TagGraph = Record<string, string[]>;

export const resolveTagGraph = (graph: TagGraph): TagGraph => {
  const memo = new Map<string, string[]>();

  const dfs = (nodeId: string, visited = new Set<string>()): string[] => {
    const cachedValues = memo.get(nodeId);
    if (cachedValues) {
      return cachedValues;
    }

    if (visited.has(nodeId)) {
      return [];
    }

    const nextStack = new Set(visited);
    nextStack.add(nodeId);

    const neighbors = graph[nodeId] ?? [];
    const flattenedValues = neighbors.flatMap((neighbor) => {
      if (!neighbor.startsWith("#")) {
        return [neighbor];
      }

      return dfs(fromTagRef(neighbor), nextStack);
    });

    const uniqueValues = [...new Set(flattenedValues)];
    memo.set(nodeId, uniqueValues);
    return uniqueValues;
  };

  const sortedNodeIds = Object.keys(graph).sort((left, right) => left.localeCompare(right));

  return Object.fromEntries(sortedNodeIds.map((nodeId) => [nodeId, dfs(nodeId)]));
};

export const supportsItemTagsForVersion = (version: MinecraftVersion) =>
  version === MinecraftVersion.Bedrock || isVersionAtLeast(version, MinecraftVersion.V113);

export const supportsCustomTagsForVersion = (version: MinecraftVersion) =>
  isVersionAtLeast(version, MinecraftVersion.V113);

export const createEmptyTag = (existingTags: Tag[]): Tag => {
  const existingNumbers = existingTags
    .map((tag) => parseStringToMinecraftIdentifier(tag.id).id.match(/^custom_tag_(\d+)$/))
    .filter(Boolean)
    .map((match) => Number(match![1]));
  const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

  return {
    uid: generateUid("tag"),
    id: `${DEFAULT_TAG_NAMESPACE}:${DEFAULT_TAG_NAME}_${nextNumber}`,
    values: [],
  };
};

export const resolveTagValues = (
  values: TagValue[],
  customTags: Tag[],
  vanillaTags: Record<string, string[]>,
): string[] => {
  const graph: TagGraph = { ...vanillaTags };
  for (const tag of customTags) {
    const rawId = getRawId(getCustomTagIdentifier(tag));
    graph[rawId] = tag.values.map((v) =>
      v.type === "tag" ? toTagRef(getRawId(v.id)) : identifierUniqueKey(v.id),
    );
  }

  const resolved = resolveTagGraph(graph);

  const results: string[] = [];
  const seen = new Set<string>();
  for (const value of values) {
    const items =
      value.type === "item"
        ? [identifierUniqueKey(value.id)]
        : (resolved[getRawId(value.id)] ?? []);
    for (const item of items) {
      if (!seen.has(item)) {
        seen.add(item);
        results.push(item);
      }
    }
  }
  return results;
};

export const getFirstAvailableTexture = (
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
      left.tagSource === right.tagSource &&
      left.uid === right.uid &&
      identifierUniqueKey(left.id) === identifierUniqueKey(right.id)
    );
  }

  if (left.type === "custom_item" && right.type === "custom_item") {
    return left.uid === right.uid;
  }

  return identifierUniqueKey(left.id) === identifierUniqueKey(right.id);
};
