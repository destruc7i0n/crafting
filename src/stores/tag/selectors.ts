import { TagState } from "./index";

export const selectTags = (state: TagState) => state.tags;

export const selectTagByUid = (uid: string) => (state: TagState) =>
  state.tags.find((tag) => tag.uid === uid);
