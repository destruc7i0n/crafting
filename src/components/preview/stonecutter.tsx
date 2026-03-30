import { ItemPreviewDropTarget } from "../item/item-preview-drop-target";
import { ItemPreviewResultSlot } from "../item/item-preview-result-slot";

export const StonecutterPreview = () => {
  return (
    <div
      className="relative h-[172px] w-[352px] bg-contain bg-center bg-no-repeat [image-rendering:crisp-edges] [image-rendering:pixelated]"
      style={{ backgroundImage: `url(/assets/ui/stonecutter.png)` }}
    >
      <ItemPreviewDropTarget
        slot="stonecutter.ingredient"
        style={{ position: "absolute", top: 64, left: 38 }}
      />

      <ItemPreviewResultSlot
        slot="stonecutter.result"
        width={52}
        height={52}
        style={{ position: "absolute", top: 56, right: 24 }}
      />
    </div>
  );
};
