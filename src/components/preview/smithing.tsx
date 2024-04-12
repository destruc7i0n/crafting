import SmithingUI from "@/assets/ui/smithing.png";

import { ConnectedGridItem } from "../slot/connected-slot";

export const SmithingPreview = () => {
  return (
    <div className="relative h-[172px] w-[352px]">
      <img
        src={SmithingUI}
        alt="Smithing Table"
        draggable={false}
        className="h-full w-full select-none [image-rendering:pixelated]"
      />

      <ConnectedGridItem
        slot="smithing.template"
        style={{ position: "absolute", bottom: 42, left: 14 }}
      />
      <ConnectedGridItem
        slot="smithing.base"
        style={{ position: "absolute", bottom: 42, left: 14 + 36 }}
      />
      <ConnectedGridItem
        slot="smithing.addition"
        style={{ position: "absolute", bottom: 42, left: 14 + 36 * 2 }}
      />

      <ConnectedGridItem
        slot="smithing.result"
        style={{ position: "absolute", bottom: 42, left: 194 }}
      />
    </div>
  );
};
