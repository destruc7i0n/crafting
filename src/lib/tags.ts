import { NoTextureTexture } from "@/data/constants";
import {
  getRawId,
  identifierUniqueKey,
  parseStringToMinecraftIdentifier,
} from "@/data/models/identifier/utilities";
import { CustomItem, IngredientItem, Item, Tag, TagItem, TagValue } from "@/data/models/types";
import { MinecraftVersion } from "@/data/types";
import { generateUid } from "@/lib/utils";

const DEFAULT_TAG_NAME = "custom_tag";
const DEFAULT_TAG_NAMESPACE = "crafting";

export const unique = (values: string[]) => [...new Set(values)];

export const getCustomTagIdentifier = (tag: Pick<Tag, "id">) =>
  parseStringToMinecraftIdentifier(tag.id);

export const getTagLabel = (raw: string) => toTagRef(raw);

export const toTagRef = (rawId: string): string => `#${rawId}`;
const fromTagRef = (ref: string): string => ref.slice(1);
export const getDuplicateTagIdErrorMessage = (rawId: string) => `Duplicate tag id: ${rawId}`;

export type TagGraph = Record<string, string[]>;

// vanilla graph + the user-authored entities a value may point at
// SlotContext satisfies this structurally
export interface TagContext {
  customItemsByUid: Record<string, CustomItem>;
  tagsByUid: Record<string, Tag>;
  allTags: Tag[];
  vanillaTags: Record<string, string[]>;
}

export const toByUidMap = <T extends { uid: string }>(values: T[]): Record<string, T> =>
  Object.fromEntries(values.map((value) => [value.uid, value]));

// keyed by identifier, unlike TagContext which is keyed by uid
// kept as two maps because itemsById holds ~1500 entries and callers resolve per slot
export interface ItemLookup {
  itemsById?: Record<string, Item>;
  customItemsById?: Record<string, CustomItem>;
}

// vanilla wins on a shadowed id: a custom item named minecraft:stone exports as vanilla stone
export const lookupItem = (
  lookup: ItemLookup | undefined,
  key: string,
): Item | CustomItem | undefined => lookup?.itemsById?.[key] ?? lookup?.customItemsById?.[key];

export const buildCustomItemsById = (customItems: CustomItem[]): Record<string, CustomItem> =>
  Object.fromEntries(customItems.map((item) => [identifierUniqueKey(item.id), item]));

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

// never includes a data value - that is bedrock-only, and bedrock has no custom tags
const tagValueRawId = (value: TagValue, ctx: TagContext): string | undefined => {
  switch (value.type) {
    case "item":
    case "tag":
      return getRawId(value.id);
    case "custom_item": {
      const item = ctx.customItemsByUid[value.uid];
      return item && getRawId(item.id);
    }
    case "custom_tag": {
      const tag = ctx.tagsByUid[value.uid];
      return tag && getRawId(getCustomTagIdentifier(tag));
    }
  }
};

const isTagRefValue = (value: TagValue) => value.type === "tag" || value.type === "custom_tag";

// a value shape this build does not know (older bundle, hand-edited storage) still needs a key
const unknownTagValueKey = (value: never): string => {
  const { type, uid } = value as { type?: string; uid?: string };

  return `${type ?? "unknown"}:${uid ?? ""}`;
};

// namespaced by discriminant: an item and a tag can share a raw id, so a bare one is not a key
export const tagValueKey = (value: TagValue): string => {
  switch (value.type) {
    case "custom_item":
    case "custom_tag":
      return `${value.type}:${value.uid}`;
    case "item":
    case "tag":
      return `${value.type}:${getRawId(value.id)}`;
    default:
      return unknownTagValueKey(value);
  }
};

// what this value contributes to a tag file, and its node id in the graph
// undefined when a uid points at nothing; callers drop it rather than emit a broken ref
export const tagValueExportRef = (value: TagValue, ctx: TagContext): string | undefined => {
  const rawId = tagValueRawId(value, ctx);
  if (rawId === undefined) {
    return undefined;
  }

  return isTagRefValue(value) ? toTagRef(rawId) : rawId;
};

// the resolved item ids this value stands for, given an already-resolved graph
const tagValueLookupKeys = (value: TagValue, resolved: TagGraph, ctx: TagContext): string[] => {
  const rawId = tagValueRawId(value, ctx);
  if (rawId === undefined) {
    return [];
  }

  return isTagRefValue(value) ? (resolved[rawId] ?? []) : [rawId];
};

// mirrors toRecipeSlotValue: user-authored entities become uid refs, vanilla keeps its id
export const toTagValue = (item: IngredientItem): TagValue => {
  if (item.type === "custom_item") {
    return { type: "custom_item", uid: item.uid };
  }

  if (item.type === "tag_item") {
    return item.tagSource === "custom" && item.uid
      ? { type: "custom_tag", uid: item.uid }
      : { type: "tag", id: { ...item.id } };
  }

  return { type: "item", id: { ...item.id } };
};

// re-points identifier-stored tag refs at the tag's uid
// safe unconditionally: a custom tag already shadows a same-named vanilla one
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

// strips any data value, so stored values hold the invariant above by construction
export const normalizeTagValue = (value: TagValue): TagValue => {
  switch (value.type) {
    case "custom_item":
    case "custom_tag":
      return value;
    case "item":
    case "tag":
      return { type: value.type, id: { namespace: value.id.namespace, id: value.id.id } };
    default:
      return value;
  }
};

// custom tags are written last, so a custom tag shadows a same-named vanilla one
export const buildTagGraph = (ctx: TagContext): TagGraph => {
  const graph: TagGraph = { ...ctx.vanillaTags };

  for (const tag of ctx.allTags) {
    const rawId = getRawId(getCustomTagIdentifier(tag));
    graph[rawId] = tag.values
      .map((value) => tagValueExportRef(value, ctx))
      .filter((ref): ref is string => ref !== undefined);
  }

  return graph;
};

// resolveTagGraph silently truncates cycles, so export validation needs its own detector
export const findCyclicTagNodes = (graph: TagGraph): Set<string> => {
  const cyclic = new Set<string>();
  const settled = new Set<string>();

  const visit = (nodeId: string, stack: string[]) => {
    const stackIndex = stack.indexOf(nodeId);
    if (stackIndex !== -1) {
      // only the nodes from the repeat onwards are on the cycle; earlier ones just lead into it
      for (const member of stack.slice(stackIndex)) {
        cyclic.add(member);
      }
      return;
    }

    if (settled.has(nodeId)) {
      return;
    }

    stack.push(nodeId);
    for (const neighbor of graph[nodeId] ?? []) {
      if (neighbor.startsWith("#")) {
        visit(fromTagRef(neighbor), stack);
      }
    }
    stack.pop();
    settled.add(nodeId);
  };

  for (const nodeId of Object.keys(graph)) {
    visit(nodeId, []);
  }

  return cyclic;
};

export const resolveTagValues = (values: TagValue[], ctx: TagContext): string[] => {
  const resolved = resolveTagGraph(buildTagGraph(ctx));

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
  lookup: ItemLookup | undefined,
): string => {
  if (!lookup) {
    return NoTextureTexture;
  }

  for (const valueId of valueIds) {
    const item = lookupItem(lookup, valueId);
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
  lookup?: ItemLookup;
  tagSource: TagItem["tagSource"];
  uid?: string;
};

export const createTagItem = ({
  rawId,
  displayName,
  values,
  version,
  lookup,
  tagSource,
  uid,
}: CreateTagItemInput): TagItem => {
  const uniqueValues = unique(values);

  return {
    type: "tag_item",
    id: parseStringToMinecraftIdentifier(rawId),
    displayName: displayName ?? getTagLabel(rawId),
    texture: getFirstAvailableTexture(uniqueValues, lookup),
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
