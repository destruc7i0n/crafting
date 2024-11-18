import { ItemPreviewDropTarget } from "../item/item-preview-drop-target";

export const SmithingPreview = () => {
  return (
    <div
      className="relative h-[172px] w-[352px] bg-contain bg-center bg-no-repeat [image-rendering:crisp-edges] [image-rendering:pixelated]"
      style={{ backgroundImage: `url(/assets/ui/smithing.png)` }}
    >
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

      <ItemPreviewDropTarget
        slot="smithing.result"
        showCount
        style={{ position: "absolute", bottom: 42, left: 194 }}
      />
    </div>
  );
};
