import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import {
  identifierUniqueKey,
  parseStringToMinecraftIdentifier,
} from "@/data/models/identifier/utilities";
import { Tag, TagValue } from "@/data/models/types";
import { assertUniqueTagId, createEmptyTag } from "@/lib/tags";

export interface TagState {
  tags: Tag[];
}

type TagActions = {
  createTag: (initial?: Partial<Pick<Tag, "id" | "values">>) => boolean;
  updateTag: (uid: string, updates: Partial<Pick<Tag, "id">>) => boolean;
  removeTag: (uid: string) => void;
  addValueToTag: (uid: string, value: TagValue) => boolean;
  removeValueFromTagByIndex: (uid: string, index: number) => boolean;
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
        if (initial?.values !== undefined) tag.values = initial.values;

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

          if (updates.id !== undefined && updates.id !== tag.id) {
            // keep parent tag refs in sync when a referenced tag id changes
            const oldIdentifier = parseStringToMinecraftIdentifier(tag.id);
            const newIdentifier = parseStringToMinecraftIdentifier(updates.id);
            const oldKey = identifierUniqueKey(oldIdentifier);
            const newKey = identifierUniqueKey(newIdentifier);

            tag.id = updates.id;
            didUpdate = true;

            if (oldKey === newKey) {
              return;
            }

            for (const currentTag of state.tags) {
              for (const value of currentTag.values) {
                if (value.type === "tag" && identifierUniqueKey(value.id) === oldKey) {
                  value.id = newIdentifier;
                }
              }
            }
          }
        });

        return didUpdate;
      },
      removeTag: (uid) => {
        set((state) => {
          state.tags = state.tags.filter((tag) => tag.uid !== uid);
        });
      },

      addValueToTag: (uid, value) => {
        let didAdd = false;

        set((state) => {
          const tag = state.tags.find((currentTag) => currentTag.uid === uid);
          if (
            !tag ||
            tag.values.some(
              (currentValue) =>
                identifierUniqueKey(currentValue.id) === identifierUniqueKey(value.id),
            )
          ) {
            return;
          }

          tag.values.push(value);
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
      version: 0,
      partialize: (state) => ({ tags: state.tags }),
    },
  ),
);
