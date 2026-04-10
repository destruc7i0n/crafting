import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import {
  identifierUniqueKey,
  parseStringToMinecraftIdentifier,
} from "@/data/models/identifier/utilities";
import { Tag, TagValue } from "@/data/models/types";
import { createEmptyTag } from "@/lib/tags";
import { useRecipeStore } from "@/stores/recipe";

export interface TagState {
  tags: Tag[];
}

type TagActions = {
  createTag: (initial?: Partial<Pick<Tag, "id" | "values">>) => string;
  updateTag: (uid: string, updates: Partial<Pick<Tag, "id">>) => void;
  removeTag: (uid: string) => void;
  addValueToTag: (uid: string, value: TagValue) => void;
  removeValueFromTagByIndex: (uid: string, index: number) => void;
};

export const useTagStore = create<TagState & TagActions>()(
  persist(
    immer((set, get) => ({
      tags: [],

      createTag: (initial) => {
        const tag = createEmptyTag(get().tags);

        if (initial?.id !== undefined) tag.id = initial.id;
        if (initial?.values !== undefined) tag.values = initial.values;

        set((state) => {
          state.tags.push(tag);
        });

        return tag.uid;
      },
      updateTag: (uid, updates) => {
        set((state) => {
          const tag = state.tags.find((value) => value.uid === uid);
          if (!tag) {
            return;
          }

          if (updates.id !== undefined) {
            // keep parent tag refs in sync when a referenced tag id changes
            const oldIdentifier = parseStringToMinecraftIdentifier(tag.id);
            const newIdentifier = parseStringToMinecraftIdentifier(updates.id);
            const oldKey = identifierUniqueKey(oldIdentifier);
            const newKey = identifierUniqueKey(newIdentifier);

            tag.id = updates.id;

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
      },
      removeTag: (uid) => {
        set((state) => {
          state.tags = state.tags.filter((tag) => tag.uid !== uid);
        });
        useRecipeStore
          .getState()
          .removeMatchingSlotValues((value) => value.kind === "custom_tag" && value.uid === uid);
      },

      addValueToTag: (uid, value) => {
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
        });
      },

      removeValueFromTagByIndex: (uid, index) => {
        set((state) => {
          const tag = state.tags.find((currentTag) => currentTag.uid === uid);
          if (!tag) {
            return;
          }

          tag.values.splice(index, 1);
        });
      },
    })),
    {
      name: "crafting-custom-tags",
      version: 0,
      partialize: (state) => ({ tags: state.tags }),
    },
  ),
);
