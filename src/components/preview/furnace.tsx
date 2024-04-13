import { ConnectedGridItem } from "../slot/connected-slot";

export const FurnacePreview = () => {
  return (
    <div
      className="relative h-[172px] w-[352px] bg-contain bg-center bg-no-repeat [image-rendering:crisp-edges] [image-rendering:pixelated]"
      style={{ backgroundImage: `url(/assets/ui/furnace.png)` }}
    >
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
