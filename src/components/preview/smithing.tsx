import { ItemPreviewDropTarget } from "../item/item-preview-drop-target";
import { ItemPreviewResultSlot } from "../item/item-preview-result-slot";
import { MinecraftUiLabel } from "./minecraft-ui-label";

export const SmithingPreview = () => {
  return (
    <div
      className="relative h-[172px] w-[352px] bg-contain bg-center bg-no-repeat [image-rendering:crisp-edges] [image-rendering:pixelated]"
      style={{ backgroundImage: `url(/assets/ui/smithing.png)` }}
    >
      <MinecraftUiLabel top={42} left={88}>
        Upgrade Gear
      </MinecraftUiLabel>

      <ItemPreviewDropTarget
        slot="smithing.template"
        style={{ position: "absolute", bottom: 42, left: 14 }}
      />
      <ItemPreviewDropTarget
        slot="smithing.base"
        style={{ position: "absolute", bottom: 42, left: 14 + 36 }}
      />
      <ItemPreviewDropTarget
        slot="smithing.addition"
        style={{ position: "absolute", bottom: 42, left: 14 + 36 * 2 }}
      />

      <ItemPreviewResultSlot
        slot="smithing.result"
        style={{ position: "absolute", bottom: 42, left: 194 }}
      />
    </div>
  );
};
