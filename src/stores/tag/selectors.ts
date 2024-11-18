import { TagState } from "./index";

export const selectTags = (state: TagState) => state.tags;

export const selectCurrentTag = (state: TagState) =>
  state.tags[state.selectedTagIndex];
