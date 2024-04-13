import { ConnectedGridItem } from "../slot/connected-slot";

export const SmithingPreview = () => {
  return (
    <div
      className="relative h-[172px] w-[352px] bg-contain bg-center bg-no-repeat [image-rendering:crisp-edges] [image-rendering:pixelated]"
      style={{ backgroundImage: `url(/assets/ui/smithing.png)` }}
    >
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
