import { CustomItemState } from "./index";

export const selectCustomItems = (state: CustomItemState) => state.customItems;

export const selectCustomItemByUid = (uid: string) => (state: CustomItemState) =>
  state.customItems.find((item) => item.uid === uid);
