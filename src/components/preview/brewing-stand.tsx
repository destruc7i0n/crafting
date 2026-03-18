import { ItemPreviewDropTarget } from "../item/item-preview-drop-target";
import { SlotDropTarget } from "../slot/slot-drop-target";

export const BrewingStandPreview = () => {
  return (
    <div
      className="relative h-[172px] w-[352px] bg-contain bg-center bg-no-repeat [image-rendering:crisp-edges] [image-rendering:pixelated]"
      style={{ backgroundImage: `url(/assets/ui/brewing_stand.png)` }}
    >
      <ItemPreviewDropTarget
        slot="brewing.reagent"
        style={{ position: "absolute", top: 32, left: 156 }}
      />
      <ItemPreviewDropTarget
        slot="brewing.input"
        style={{ position: "absolute", top: 100, left: 110 }}
      />
      <ItemPreviewDropTarget
        slot="brewing.result"
        style={{ position: "absolute", top: 100, left: 202 }}
      />

      {/* fuel - greys out during drag */}
      <SlotDropTarget
        data={{}}
        canDrop={() => false}
        inert
        style={{ position: "absolute", top: 32, left: 32 }}
      />
    </div>
  );
};
