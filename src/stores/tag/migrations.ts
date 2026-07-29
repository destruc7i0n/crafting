import { Tag } from "@/data/models/types";
import { upgradeLegacyTagRefs } from "@/lib/tags";

export interface TagState {
  tags: Tag[];
}

/**
 * Bump this with every shape change, and add the matching entry to `tagMigrations`. Bumping without
 * a migration makes zustand fall through to `merge(undefined)` and replace the store, so the two
 * must always land together.
 */
export const TAG_STORE_VERSION = 1;

/**
 * Keyed by the version each step upgrades *to*, and applied only when the persisted state is older
 * than that key. Steps run oldest-first, so a payload several versions behind is brought forward one
 * step at a time and a newer payload skips every step.
 */
export type TagMigrations = Record<number, (state: TagState) => TagState>;

export const tagMigrations: TagMigrations = {
  // custom tag references used to be stored by identifier rather than by uid
  1: (state) => ({ tags: upgradeLegacyTagRefs(state.tags) }),
};

const toTagState = (persisted: unknown): TagState => {
  const tags =
    persisted && typeof persisted === "object" && "tags" in persisted
      ? (persisted as TagState).tags
      : undefined;

  return { tags: Array.isArray(tags) ? tags : [] };
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
