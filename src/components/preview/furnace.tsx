import FurnaceUI from "@/assets/ui/furnace.png";

import { ConnectedGridItem } from "../slot/connected-slot";

export const FurnacePreview = () => {
  return (
    <div className="relative h-[172px] w-[352px]">
      <img
        src={FurnaceUI}
        alt="Furnace"
        draggable={false}
        className="h-full w-full select-none [image-rendering:pixelated]"
      />

      <ConnectedGridItem
        slot="cooking.ingredient"
        style={{ position: "absolute", top: 32, left: 110 }}
      />

      <ConnectedGridItem
        slot="cooking.result"
        height={52}
        width={52}
        style={{ position: "absolute", top: 60, right: 78 }}
      />
    </div>
  );
};
