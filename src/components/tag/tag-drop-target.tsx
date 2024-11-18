import { TagDropTargetData } from "@/lib/dnd";

import { SlotDropTarget } from "../slot/slot-drop-target";

export const TagDropTarget = () => {
  return (
    <SlotDropTarget<TagDropTargetData>
      data={{ type: "tag-creation" }}
      height={52}
      width={52}
    />
  );
};
