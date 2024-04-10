import { ConnectedGridItem } from "./grid-item/connected-grid-item";

export const CraftingGrid = () => {
  return (
    <div className="flex max-w-[108px] flex-wrap">
      <ConnectedGridItem slot="crafting.1" />
      <ConnectedGridItem slot="crafting.2" />
      <ConnectedGridItem slot="crafting.3" />

      <ConnectedGridItem slot="crafting.4" />
      <ConnectedGridItem slot="crafting.5" />
      <ConnectedGridItem slot="crafting.6" />

      <ConnectedGridItem slot="crafting.7" />
      <ConnectedGridItem slot="crafting.8" />
      <ConnectedGridItem slot="crafting.9" />
    </div>
  );
};
