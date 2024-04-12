import StonecutterUI from "@/assets/ui/stonecutter.png";

import { ConnectedGridItem } from "../slot/connected-slot";

export const StonecutterPreview = () => {
  return (
    <div className="relative h-[172px] w-[352px]">
      <img
        src={StonecutterUI}
        alt="StoneCutter"
        draggable={false}
        className="h-full w-full select-none [image-rendering:pixelated]"
      />

      <ConnectedGridItem
        slot="stonecutter.ingredient"
        style={{ position: "absolute", top: 64, left: 38 }}
      />

      <ConnectedGridItem
        slot="stonecutter.result"
        width={52}
        height={52}
        style={{ position: "absolute", top: 56, right: 24 }}
      />
    </div>
  );
};
