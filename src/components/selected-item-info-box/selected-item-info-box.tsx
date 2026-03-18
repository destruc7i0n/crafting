import { useUIStore } from "@/stores/ui";

import { ItemInfoBox } from "./item-info-box";

export const SelectedItemInfoBox = () => {
  const selectedPreview = useUIStore((state) => state.selectedPreview);
  const selectedIngredient = useUIStore((state) => state.selectedIngredient);

  if (!selectedPreview && !selectedIngredient) {
    return null;
  }

  return (
    <div className="pt-4 lg:hidden">
      {selectedPreview ? (
        <ItemInfoBox
          item={selectedPreview.item}
          slot={selectedPreview.slot}
          pendingReplace={selectedPreview.replaceTarget !== undefined}
        />
      ) : (
        <ItemInfoBox
          item={selectedIngredient!.item}
          pendingReplace={selectedIngredient!.replaceTarget !== undefined}
        />
      )}
    </div>
  );
};
