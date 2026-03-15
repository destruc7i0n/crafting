import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { Tag, TagValue } from "@/data/models/types";
import { createEmptyTag } from "@/lib/tags";

export interface TagState {
  tags: Tag[];
}

type TagActions = {
  createTag: () => string;
  updateTag: (uid: string, updates: Partial<Pick<Tag, "name" | "namespace">>) => void;
  removeTag: (uid: string) => void;
  addValueToTag: (uid: string, value: TagValue) => void;
  removeValueFromTagByIndex: (uid: string, index: number) => void;
};

export const useTagStore = create<TagState & TagActions>()(
  persist(
    immer((set, get) => ({
      tags: [],

      createTag: () => {
        const tag = createEmptyTag(get().tags);

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

          if (updates.name !== undefined) {
            tag.name = updates.name;
          }

          if (updates.namespace !== undefined) {
            tag.namespace = updates.namespace;
          }
        });
      },
      removeTag: (uid) => {
        set((state) => {
          state.tags = state.tags.filter((tag) => tag.uid !== uid);
        });
      },

      addValueToTag: (uid, value) => {
        set((state) => {
          const tag = state.tags.find((currentTag) => currentTag.uid === uid);
          if (!tag || tag.values.some((currentValue) => currentValue.id.raw === value.id.raw)) {
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
      partialize: (state) => ({ tags: state.tags }),
    },
  ),
);
