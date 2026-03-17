import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { getRawId, identifierUniqueKey } from "@/data/models/identifier/utilities";
import { Tag, TagValue } from "@/data/models/types";
import { createEmptyTag, getCustomTagIdentifier, getTagLabel } from "@/lib/tags";
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
        let nextIdentifier: ReturnType<typeof getCustomTagIdentifier> | undefined;

        set((state) => {
          const tag = state.tags.find((value) => value.uid === uid);
          if (!tag) {
            return;
          }

          if (updates.id !== undefined) {
            tag.id = updates.id;
          }

          nextIdentifier = getCustomTagIdentifier(tag);
        });

        if (!nextIdentifier) {
          return;
        }

        const identifier = nextIdentifier;

        useRecipeStore.getState().syncCustomSlotItem(
          (slotItem) => slotItem.type === "tag_item" && slotItem.uid === uid,
          (slotItem) => {
            slotItem.id = { ...identifier };
            slotItem.displayName = getTagLabel(getRawId(identifier));
          },
        );
      },
      removeTag: (uid) => {
        set((state) => {
          state.tags = state.tags.filter((tag) => tag.uid !== uid);
        });
        useRecipeStore
          .getState()
          .removeMatchingSlotItems((item) => item.type === "tag_item" && item.uid === uid);
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
