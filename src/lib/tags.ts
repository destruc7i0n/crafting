import { NoTextureTexture } from "@/data/constants";
import {
  getRawId,
  identifierUniqueKey,
  parseStringToMinecraftIdentifier,
} from "@/data/models/identifier/utilities";
import { IngredientItem, Item, Tag, TagItem, TagValue } from "@/data/models/types";
import { MinecraftVersion } from "@/data/types";
import { generateUid } from "@/lib/utils";

const DEFAULT_TAG_NAME = "custom_tag";
const DEFAULT_TAG_NAMESPACE = "crafting";

const unique = (values: string[]) => [...new Set(values)];

export const getCustomTagIdentifier = (tag: Pick<Tag, "id">) =>
  parseStringToMinecraftIdentifier(tag.id);

export const getTagLabel = (raw: string) => toTagRef(raw);

export const toTagRef = (rawId: string): string => `#${rawId}`;
const fromTagRef = (ref: string): string => ref.slice(1);
export const getDuplicateTagIdErrorMessage = (rawId: string) => `Duplicate tag id: ${rawId}`;

export type TagGraph = Record<string, string[]>;

/**
 * Everything needed to resolve a tag value: the vanilla tag graph plus the user-authored entities a
 * value may point at. `SlotContext` satisfies this structurally, so anything holding one passes it
 * directly.
 */
export interface TagContext {
  tagsByUid: Record<string, Tag>;
  allTags: Tag[];
  vanillaTags: Record<string, string[]>;
}

export const toByUidMap = <T extends { uid: string }>(values: T[]): Record<string, T> =>
  Object.fromEntries(values.map((value) => [value.uid, value]));

export const hasDuplicateTagId = (tags: Tag[], rawId: string, ignoreUid?: string) => {
  const nextKey = identifierUniqueKey(parseStringToMinecraftIdentifier(rawId));

  return tags.some(
    (tag) =>
      tag.uid !== ignoreUid &&
      identifierUniqueKey(parseStringToMinecraftIdentifier(tag.id)) === nextKey,
  );
};

export const assertUniqueTagId = (tags: Tag[], rawId: string, ignoreUid?: string) => {
  if (hasDuplicateTagId(tags, rawId, ignoreUid)) {
    throw new Error(getDuplicateTagIdErrorMessage(rawId));
  }
};

type DfsResult = { values: string[]; complete: boolean };

export const resolveTagGraph = (graph: TagGraph): TagGraph => {
  const memo = new Map<string, string[]>();

  const dfs = (nodeId: string, visited = new Set<string>()): DfsResult => {
    const cachedValues = memo.get(nodeId);
    if (cachedValues) {
      return { values: cachedValues, complete: true };
    }

    if (visited.has(nodeId)) {
      return { values: [], complete: false };
    }

    const nextStack = new Set(visited);
    nextStack.add(nodeId);

    let complete = true;
    const neighbors = graph[nodeId] ?? [];
    const flattenedValues = neighbors.flatMap((neighbor) => {
      if (!neighbor.startsWith("#")) {
        return [neighbor];
      }

      const result = dfs(fromTagRef(neighbor), nextStack);
      complete &&= result.complete;
      return result.values;
    });

    const uniqueValues = [...new Set(flattenedValues)];
    // Results computed while a cycle excluded part of the graph are partial;
    // caching them would poison later lookups of the same node
    if (complete) {
      memo.set(nodeId, uniqueValues);
    }
    return { values: uniqueValues, complete };
  };

  const sortedNodeIds = Object.keys(graph).sort((left, right) => left.localeCompare(right));

  return Object.fromEntries(sortedNodeIds.map((nodeId) => [nodeId, dfs(nodeId).values]));
};

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

/**
 * A tag value is identified by its raw id, never including a data value.
 *
 * Nothing reachable can supply one: `data` is only ever set for Bedrock items (`resolveItemId`), and
 * `supportsCustomTags` excludes Bedrock. Ignoring it on read and stripping it on write is therefore
 * defence against hand-edited storage, and keeps in-app resolution in agreement with the exported
 * JSON, which can only emit `namespace:id` — `data` in a 1.13+ tag file is invalid.
 */
const tagValueRawId = (value: TagValue, ctx: TagContext): string | undefined => {
  switch (value.type) {
    case "item":
    case "tag":
      return getRawId(value.id);
    case "custom_tag": {
      const tag = ctx.tagsByUid[value.uid];
      return tag && getRawId(getCustomTagIdentifier(tag));
    }
  }
};

const isTagRefValue = (value: TagValue) => value.type === "tag" || value.type === "custom_tag";

/**
 * Identity of a tag value, namespaced by its discriminant. An item and a tag can legitimately share
 * a raw id, so a bare identifier is not a usable key. uid arms key on the uid, which is stable
 * across renames of the entity they point at.
 */
export const tagValueKey = (value: TagValue): string =>
  value.type === "custom_tag"
    ? `${value.type}:${value.uid}`
    : `${value.type}:${getRawId(value.id)}`;

/**
 * The string this value contributes to a datapack tag file, and — because both sides agree on the
 * raw id — the same string it contributes as a node in the tag graph. `undefined` when a uid points
 * at nothing; callers drop it rather than emitting a broken ref.
 */
export const tagValueExportRef = (value: TagValue, ctx: TagContext): string | undefined => {
  const rawId = tagValueRawId(value, ctx);
  if (rawId === undefined) {
    return undefined;
  }

  return isTagRefValue(value) ? toTagRef(rawId) : rawId;
};

/** The resolved item ids this value stands for, given an already-resolved tag graph. */
const tagValueLookupKeys = (value: TagValue, resolved: TagGraph, ctx: TagContext): string[] => {
  const rawId = tagValueRawId(value, ctx);
  if (rawId === undefined) {
    return [];
  }

  return isTagRefValue(value) ? (resolved[rawId] ?? []) : [rawId];
};

/**
 * Builds the tag value for a picked ingredient. Mirrors `toRecipeSlotValue`: user-authored entities
 * become uid refs, everything else keeps its identifier.
 */
export const toTagValue = (item: IngredientItem): TagValue => {
  if (item.type === "tag_item") {
    return item.tagSource === "custom" && item.uid
      ? { type: "custom_tag", uid: item.uid }
      : { type: "tag", id: { ...item.id } };
  }

  return { type: "item", id: { ...item.id } };
};

/**
 * Re-points tag references stored by identifier at the referenced tag's uid.
 *
 * Unconditional, because `resolveTagValues` builds the graph from vanilla tags and *then* overwrites
 * with custom ones — a custom tag already shadows a same-named vanilla tag, so this reproduces the
 * previous resolution exactly. Item values are untouched: an item that happens to share a tag's id
 * is still an item.
 */
export const upgradeLegacyTagRefs = (tags: Tag[]): Tag[] => {
  const uidByRawId = new Map(tags.map((tag) => [getRawId(getCustomTagIdentifier(tag)), tag.uid]));

  return tags.map((tag) => ({
    ...tag,
    values: tag.values.map((value): TagValue => {
      if (value.type !== "tag") {
        return value;
      }

      const uid = uidByRawId.get(getRawId(value.id));
      return uid ? { type: "custom_tag", uid } : value;
    }),
  }));
};

/** Strips any data value, so stored tag values satisfy the invariant above by construction. */
export const normalizeTagValue = (value: TagValue): TagValue =>
  value.type === "custom_tag"
    ? value
    : { type: value.type, id: { namespace: value.id.namespace, id: value.id.id } };

export const resolveTagValues = (values: TagValue[], ctx: TagContext): string[] => {
  const graph: TagGraph = { ...ctx.vanillaTags };
  for (const tag of ctx.allTags) {
    const rawId = getRawId(getCustomTagIdentifier(tag));
    graph[rawId] = tag.values
      .map((value) => tagValueExportRef(value, ctx))
      .filter((ref): ref is string => ref !== undefined);
  }

  const resolved = resolveTagGraph(graph);

  const results: string[] = [];
  const seen = new Set<string>();
  for (const value of values) {
    const items = tagValueLookupKeys(value, resolved, ctx);
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
