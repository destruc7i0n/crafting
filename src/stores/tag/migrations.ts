import { Tag, TagValue } from "@/data/models/types";
import { upgradeLegacyTagRefs } from "@/lib/tags";

export interface TagState {
  tags: Tag[];
}

// bump with every shape change and add the matching tagMigrations entry
// bumping without one makes zustand fall through to merge(undefined) and replace the store
export const TAG_STORE_VERSION = 1;

// keyed by the version each step upgrades to, applied only when the persisted state is older
// steps run oldest-first, so an older payload is brought forward one step at a time
export type TagMigrations = Record<number, (state: TagState) => TagState>;

export const tagMigrations: TagMigrations = {
  // custom tag references used to be stored by identifier rather than by uid
  1: (state) => ({ tags: upgradeLegacyTagRefs(state.tags) }),
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toTagValues = (values: unknown[]): TagValue[] =>
  values.filter((value): value is TagValue => isObject(value) && typeof value.type === "string");

// one corrupt entry would otherwise throw inside rehydrate, and zustand's catch leaves the
// store empty - which the user's next edit then persists over their real tags
const toTag = (value: unknown): Tag | undefined => {
  if (!isObject(value) || typeof value.uid !== "string" || typeof value.id !== "string") {
    return undefined;
  }

  return {
    uid: value.uid,
    id: value.id,
    values: Array.isArray(value.values) ? toTagValues(value.values) : [],
  };
};

const toTagState = (persisted: unknown): TagState => {
  const tags = isObject(persisted) ? persisted.tags : undefined;

  return {
    tags: Array.isArray(tags) ? tags.map(toTag).filter((tag): tag is Tag => tag !== undefined) : [],
  };
};

export const migrateTagState = (
  persisted: unknown,
  fromVersion: number,
  migrations: TagMigrations = tagMigrations,
): TagState =>
  Object.keys(migrations)
    .map(Number)
    .sort((left, right) => left - right)
    .filter((version) => fromVersion < version)
    .reduce<TagState>((state, version) => migrations[version](state), toTagState(persisted));
