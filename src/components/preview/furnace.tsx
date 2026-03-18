import { ItemPreviewDropTarget } from "../item/item-preview-drop-target";
import { ItemPreviewResultSlot } from "../item/item-preview-result-slot";
import { SlotDropTarget } from "../slot/slot-drop-target";

export const FurnacePreview = () => {
  return (
    <div
      className="relative h-[172px] w-[352px] bg-contain bg-center bg-no-repeat [image-rendering:crisp-edges] [image-rendering:pixelated]"
      style={{ backgroundImage: `url(/assets/ui/furnace.png)` }}
    >
      <ItemPreviewDropTarget
        slot="cooking.ingredient"
        style={{ position: "absolute", top: 32, left: 110 }}
      />

      {/* fuel - greys out during drag */}
      <SlotDropTarget
        data={{}}
        canDrop={() => false}
        inert
        style={{ position: "absolute", top: 104, left: 110 }}
      />

      <ItemPreviewResultSlot
        slot="cooking.result"
        height={52}
        width={52}
        style={{ position: "absolute", top: 60, right: 78 }}
      />
    </div>
  );
};
