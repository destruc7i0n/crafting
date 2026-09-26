import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { MinecraftIdentifier, Tag, TagValue } from "@/data/models/types";
import { assertUniqueTagId, createEmptyTag, normalizeTagValue, tagValueKey } from "@/lib/tags";

import { migrateTagState, TAG_STORE_VERSION, type TagState } from "./migrations";

export type { TagState };

type TagActions = {
  createTag: (initial?: Partial<Pick<Tag, "id" | "values">>) => boolean;
  updateTag: (uid: string, updates: Partial<Pick<Tag, "id">>) => boolean;
  removeTag: (uid: string) => void;
  addValueToTag: (uid: string, value: TagValue) => boolean;
  removeValueFromTagByIndex: (uid: string, index: number) => boolean;
  materializeCustomTagValues: (uid: string, identifier: MinecraftIdentifier) => void;
};

export const useTagStore = create<TagState & TagActions>()(
  persist(
    immer((set, get) => ({
      tags: [],

      createTag: (initial) => {
        const existingTags = get().tags;
        const tag = createEmptyTag(existingTags);

        if (initial?.id !== undefined) {
          assertUniqueTagId(existingTags, initial.id);
          tag.id = initial.id;
        }
        if (initial?.values !== undefined) tag.values = initial.values.map(normalizeTagValue);

        set((state) => {
          state.tags.push(tag);
        });

        return true;
      },
      updateTag: (uid, updates) => {
        const tags = get().tags;
        const currentTag = tags.find((value) => value.uid === uid);
        if (!currentTag) {
          return false;
        }

        if (updates.id !== undefined) {
          assertUniqueTagId(tags, updates.id, uid);
        }

        let didUpdate = false;

        set((state) => {
          const tag = state.tags.find((value) => value.uid === uid);
          if (!tag) {
            return;
          }

          // referencing tags point at the uid, so a rename needs no ref rewriting
          if (updates.id !== undefined && updates.id !== tag.id) {
            tag.id = updates.id;
            didUpdate = true;
          }
        });

        return didUpdate;
      },
      removeTag: (uid) => {
        set((state) => {
          state.tags = state.tags.filter((tag) => tag.uid !== uid);
        });
      },

      /**
       * Converts refs to a tag that is about to be deleted into the plain identifier they used to
       * resolve to. Preserves the long-standing behaviour that a reference to a deleted tag survives
       * and still exports, instead of silently dropping a value the user never touched.
       */
      materializeCustomTagValues: (uid, identifier) => {
        set((state) => {
          for (const tag of state.tags) {
            if (!tag.values.some((value) => value.type === "custom_tag" && value.uid === uid)) {
              continue;
            }

            const seen = new Set<string>();
            // materializing can collide with a literal ref already in this tag, so re-apply the
            // uniqueness invariant addValueToTag enforces
            tag.values = tag.values
              .map(
                (value): TagValue =>
                  value.type === "custom_tag" && value.uid === uid
                    ? { type: "tag", id: { ...identifier } }
                    : value,
              )
              .filter((value) => {
                const key = tagValueKey(value);
                if (seen.has(key)) {
                  return false;
                }
                seen.add(key);
                return true;
              });
          }
        });
      },

      addValueToTag: (uid, value) => {
        let didAdd = false;
        const nextValue = normalizeTagValue(value);
        const nextKey = tagValueKey(nextValue);

        set((state) => {
          const tag = state.tags.find((currentTag) => currentTag.uid === uid);
          if (!tag || tag.values.some((currentValue) => tagValueKey(currentValue) === nextKey)) {
            return;
          }

          tag.values.push(nextValue);
          didAdd = true;
        });

        return didAdd;
      },

      removeValueFromTagByIndex: (uid, index) => {
        let didRemove = false;

        set((state) => {
          const tag = state.tags.find((currentTag) => currentTag.uid === uid);
          if (!tag || index < 0 || index >= tag.values.length) {
            return;
          }

          tag.values.splice(index, 1);
          didRemove = true;
        });

        return didRemove;
      },
    })),
    {
      name: "crafting-custom-tags",
      version: TAG_STORE_VERSION,
      partialize: (state) => ({ tags: state.tags }),
      migrate: migrateTagState,
    },
  ),
);
