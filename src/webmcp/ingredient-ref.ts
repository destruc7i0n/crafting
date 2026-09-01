import {
  getRawId,
  identifierUniqueKey,
  parseStringToMinecraftIdentifier,
} from "@/data/models/identifier/utilities";
import { MinecraftIdentifier, Tag } from "@/data/models/types";
import { createFuzzySearch } from "@/lib/fuzzy-search";
import { getCustomTagIdentifier, getTagLabel, resolveTagValues, toTagRef } from "@/lib/tags";
import { RecipeSlotValue, SlotContext } from "@/stores/recipe/types";
import {
  getMinecraftVersionLabel,
  supportsCustomTags,
  supportsItemTags,
  supportsVanillaTagList,
} from "@/versioning";

export type IngredientRefKind = "item" | "custom_item" | "vanilla_tag" | "custom_tag";

export type IngredientSearchResult = {
  ref: string;
  kind: IngredientRefKind;
  label: string;
  previewValues?: string[];
};

type IngredientCandidate = IngredientSearchResult & { searchText: string[] };

const TAG_PREFIX = "#";
const PREVIEW_VALUE_LIMIT = 5;
const SUGGESTION_LIMIT = 3;
const TAG_KINDS: IngredientRefKind[] = ["vanilla_tag", "custom_tag"];
const ITEM_KINDS: IngredientRefKind[] = ["item", "custom_item"];

const cloneIdentifier = (id: MinecraftIdentifier): MinecraftIdentifier => ({ ...id });

const toCustomTagRef = (tag: Tag) => toTagRef(identifierUniqueKey(getCustomTagIdentifier(tag)));

const buildCandidates = (slotContext: SlotContext): IngredientCandidate[] => {
  const { version, resources, allTags, vanillaTags } = slotContext;
  const candidates: IngredientCandidate[] = [];

  for (const item of resources?.items ?? []) {
    candidates.push({
      ref: identifierUniqueKey(item.id),
      kind: "item",
      label: item.displayName,
      searchText: [item.displayName, getRawId(item.id)],
    });
  }

  for (const item of Object.values(slotContext.customItemsByUid)) {
    candidates.push({
      ref: identifierUniqueKey(item.id),
      kind: "custom_item",
      label: item.displayName,
      searchText: [item.displayName, getRawId(item.id)],
    });
  }

  if (supportsVanillaTagList(version)) {
    for (const [rawId, values] of Object.entries(vanillaTags)) {
      candidates.push({
        ref: toTagRef(rawId),
        kind: "vanilla_tag",
        label: getTagLabel(rawId),
        previewValues: values.slice(0, PREVIEW_VALUE_LIMIT),
        searchText: [getTagLabel(rawId), rawId],
      });
    }
  }

  if (supportsCustomTags(version)) {
    for (const tag of allTags) {
      const rawId = getRawId(getCustomTagIdentifier(tag));

      candidates.push({
        ref: toCustomTagRef(tag),
        kind: "custom_tag",
        label: getTagLabel(rawId),
        previewValues: resolveTagValues(tag.values, allTags, vanillaTags).slice(
          0,
          PREVIEW_VALUE_LIMIT,
        ),
        searchText: [getTagLabel(rawId), rawId],
      });
    }
  }

  return candidates;
};

const toSearchResult = ({
  ref,
  kind,
  label,
  previewValues,
}: IngredientCandidate): IngredientSearchResult => ({
  ref,
  kind,
  label,
  ...(previewValues ? { previewValues } : {}),
});

export const searchIngredients = ({
  query,
  slotContext,
  limit,
  kinds,
}: {
  query: string;
  slotContext: SlotContext;
  limit: number;
  kinds?: IngredientRefKind[];
}): IngredientSearchResult[] => {
  const candidates = buildCandidates(slotContext).filter(
    (candidate) => kinds === undefined || kinds.includes(candidate.kind),
  );
  const trimmedQuery = query.trim();

  if (trimmedQuery.length === 0) {
    return candidates.slice(0, limit).map(toSearchResult);
  }

  const search = createFuzzySearch(candidates, {
    getText: (candidate: IngredientCandidate) => candidate.searchText,
    strategy: "off",
  });

  return search(trimmedQuery)
    .slice(0, limit)
    .map(({ item }) => toSearchResult(item));
};

export const suggestIngredientRefs = ({
  query,
  slotContext,
  limit = 5,
  kinds,
}: {
  query: string;
  slotContext: SlotContext;
  limit?: number;
  kinds?: IngredientRefKind[];
}): string[] => searchIngredients({ query, slotContext, limit, kinds }).map((result) => result.ref);

const createUnknownIngredientError = ({
  ref,
  slotContext,
  kinds,
}: {
  ref: string;
  slotContext: SlotContext;
  kinds: IngredientRefKind[];
}): Error => {
  const query = ref.startsWith(TAG_PREFIX) ? ref.slice(TAG_PREFIX.length) : ref;
  const suggestions = suggestIngredientRefs({ query, slotContext, limit: SUGGESTION_LIMIT, kinds });
  const resourcesNote = slotContext.resources ? "" : " (resources not loaded)";
  const suggestionText = suggestions.length > 0 ? ` Did you mean: ${suggestions.join(", ")}?` : "";

  return new Error(
    `Unknown ingredient "${ref}"${resourcesNote}.${suggestionText} Use search_items to find ids.`,
  );
};

const resolveTagRef = (ref: string, slotContext: SlotContext): RecipeSlotValue => {
  const { version } = slotContext;

  if (!supportsItemTags(version)) {
    throw new Error(`Item tags are not available in ${getMinecraftVersionLabel(version)}`);
  }

  const rawRef = ref.slice(TAG_PREFIX.length);
  if (rawRef.length === 0) {
    throw new Error("Ingredient ref must not be empty");
  }

  const identifier = parseStringToMinecraftIdentifier(rawRef);
  const rawId = getRawId(identifier);

  if (slotContext.vanillaTags[rawId]) {
    return { kind: "vanilla_tag", id: { namespace: identifier.namespace, id: identifier.id } };
  }

  if (supportsCustomTags(version)) {
    const key = identifierUniqueKey(identifier);
    const tag = slotContext.allTags.find(
      (candidate) => identifierUniqueKey(getCustomTagIdentifier(candidate)) === key,
    );

    if (tag) {
      return { kind: "custom_tag", uid: tag.uid };
    }
  }

  throw createUnknownIngredientError({ ref, slotContext, kinds: TAG_KINDS });
};

const resolveItemRef = (ref: string, slotContext: SlotContext): RecipeSlotValue => {
  const identifier = parseStringToMinecraftIdentifier(ref);
  const itemsById = slotContext.resources?.itemsById;
  const item = itemsById?.[identifierUniqueKey(identifier)] ?? itemsById?.[getRawId(identifier)];

  if (item) {
    // use the store item's id so data values are canonical
    return { kind: "item", id: cloneIdentifier(item.id) };
  }

  const key = identifierUniqueKey(identifier);
  const customItem = Object.values(slotContext.customItemsByUid).find(
    (candidate) => identifierUniqueKey(candidate.id) === key,
  );

  if (customItem) {
    return { kind: "custom_item", uid: customItem.uid };
  }

  throw createUnknownIngredientError({ ref, slotContext, kinds: ITEM_KINDS });
};

/**
 * Turns an ingredient ref string (see INGREDIENT_REF_GUIDE) into a slot value.
 * Throws a descriptive error, with suggestions, when the ref cannot be resolved.
 */
export const resolveIngredientRef = ({
  ref,
  slotContext,
}: {
  ref: string;
  slotContext: SlotContext;
}): RecipeSlotValue => {
  const trimmed = ref.trim();

  if (trimmed.length === 0) {
    throw new Error("Ingredient ref must not be empty");
  }

  return trimmed.startsWith(TAG_PREFIX)
    ? resolveTagRef(trimmed, slotContext)
    : resolveItemRef(trimmed, slotContext);
};

/**
 * Inverse of `resolveIngredientRef`. Always returns the full `namespace:id[:data]`
 * form so refs are unambiguous. Missing custom refs fall back to `<kind>:<uid>`.
 */
export const formatIngredientRef = (value: RecipeSlotValue, slotContext: SlotContext): string => {
  switch (value.kind) {
    case "item":
      return identifierUniqueKey(value.id);
    case "vanilla_tag":
      return toTagRef(getRawId(value.id));
    case "custom_item": {
      const item = slotContext.customItemsByUid[value.uid];
      return item ? identifierUniqueKey(item.id) : `custom_item:${value.uid}`;
    }
    case "custom_tag": {
      const tag = slotContext.tagsByUid[value.uid];
      return tag ? toCustomTagRef(tag) : `custom_tag:${value.uid}`;
    }
  }
};
