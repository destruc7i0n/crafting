import CraftingTableUI from "@/assets/ui/crafting_table.png";

import { ConnectedGridItem } from "../slot/connected-slot";

export const CraftingGridPreview = () => {
  return (
    <div className="relative h-[172px] w-[352px]">
      <img
        src={CraftingTableUI}
        alt="Crafting Table"
        draggable={false}
        className="h-full w-full select-none [image-rendering:pixelated]"
      />

      <ConnectedGridItem
        slot="crafting.1"
        style={{ position: "absolute", top: 32, left: 58 }}
      />
      <ConnectedGridItem
        slot="crafting.2"
        style={{ position: "absolute", top: 32, left: 58 + 36 }}
      />
      <ConnectedGridItem
        slot="crafting.3"
        style={{ position: "absolute", top: 32, left: 58 + 36 * 2 }}
      />

      <ConnectedGridItem
        slot="crafting.4"
        style={{ position: "absolute", top: 32 + 36, left: 58 }}
      />
      <ConnectedGridItem
        slot="crafting.5"
        style={{ position: "absolute", top: 32 + 36, left: 58 + 36 }}
      />
      <ConnectedGridItem
        slot="crafting.6"
        style={{ position: "absolute", top: 32 + 36, left: 58 + 36 * 2 }}
      />

      <ConnectedGridItem
        slot="crafting.7"
        style={{ position: "absolute", top: 32 + 36 * 2, left: 58 }}
      />
      <ConnectedGridItem
        slot="crafting.8"
        style={{ position: "absolute", top: 32 + 36 * 2, left: 58 + 36 }}
      />
      <ConnectedGridItem
        slot="crafting.9"
        style={{ position: "absolute", top: 32 + 36 * 2, left: 58 + 36 * 2 }}
      />

      <ConnectedGridItem
        slot="crafting.result"
        height={52}
        width={52}
        style={{ position: "absolute", top: 60, right: 62 }}
      />
    </div>
  );
};
