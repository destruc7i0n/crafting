import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { Tag, TagValue } from "@/data/models/types";

export interface TagState {
  tags: Tag[];
  selectedTagIndex: number;
}

type TagActions = {
  addTag: (tag: Tag) => void;
  removeTag: (tag: Tag) => void;

  addValueToTag: (value: TagValue) => void;
  removeValueFromTag: (value: TagValue) => void;

  selectTag: (index: number) => void;
};

export const useTagStore = create<TagState & TagActions>()(
  immer((set) => ({
    tags: [],
    selectedTagIndex: -1,

    addTag: (tag: Tag) =>
      set((state) => {
        state.tags.push(tag);
        state.selectedTagIndex = state.tags.length - 1;
      }),
    removeTag: (tag: Tag) =>
      set((state) => {
        state.tags = state.tags.filter((t) => t.id.raw !== tag.id.raw);
        state.selectedTagIndex = state.tags.length > 0 ? 0 : -1;
      }),

    addValueToTag: (value: TagValue) =>
      set((state) => {
        if (state.selectedTagIndex === -1) return;
        state.tags[state.selectedTagIndex].values.push(value);
      }),

    removeValueFromTag: (value: TagValue) =>
      set((state) => {
        if (state.selectedTagIndex === -1) return;
        state.tags[state.selectedTagIndex].values = state.tags[
          state.selectedTagIndex
        ].values.filter((v) => v.id.raw !== value.id.raw);
      }),

    selectTag: (index: number) => set({ selectedTagIndex: index }),
  })),
);
