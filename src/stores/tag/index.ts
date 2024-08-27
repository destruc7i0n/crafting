import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { Tag } from "@/data/models/types";

export interface TagState {
  tags: Tag[];
}

type TagActions = {
  addTag: (tag: Tag) => void;
  removeTag: (tag: Tag) => void;
};

export const useTagStore = create<TagState & TagActions>()(
  immer((set) => ({
    tags: [],

    addTag: (tag: Tag) => set((state) => ({ tags: [...state.tags, tag] })),
    removeTag: (tag: Tag) =>
      set((state) => ({
        tags: state.tags.filter((t) => t.id.raw !== tag.id.raw),
      })),
  })),
);
