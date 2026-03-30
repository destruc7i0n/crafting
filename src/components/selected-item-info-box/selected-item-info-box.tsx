import { useItemSelection } from "@/hooks/use-item-selection";

import { ItemInfoBox } from "./item-info-box";

export const SelectedItemInfoBox = () => {
  const selection = useItemSelection();

  if (!selection) return null;

  return (
    <div className="pt-2 md:pt-4">
      {selection.type === "preview" ? (
        <ItemInfoBox item={selection.item} slot={selection.slot} />
      ) : (
        <ItemInfoBox item={selection.item} />
      )}
    </div>
  );
};
