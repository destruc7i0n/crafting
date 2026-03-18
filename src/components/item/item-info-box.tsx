import { Trash2Icon } from "lucide-react";

import { getFullId } from "@/data/models/identifier/utilities";
import { useRecipeStore } from "@/stores/recipe";
import { ItemSelection, useUIStore } from "@/stores/ui";

type ItemInfoBoxProps = {
  selection: ItemSelection;
};

export const ItemInfoBox = ({ selection }: ItemInfoBoxProps) => {
  const { item } = selection;

  return (
    <div className="border-border bg-background/90 flex items-center gap-1 rounded-md border px-2 py-1 text-xs leading-tight shadow-sm backdrop-blur-sm">
      <div className="text-foreground min-w-0 flex-1 truncate">
        {item.type === "tag_item" ? (
          <span className="font-medium">{`#${getFullId(item.id)}`}</span>
        ) : (
          <>
            <span className="font-medium">{item.displayName}</span>
            <span className="text-muted-foreground">{` · ${getFullId(item.id)}`}</span>
          </>
        )}
      </div>
      {selection.source === "preview" && (
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer transition-colors"
          onClick={() => {
            useRecipeStore.getState().setRecipeSlot(selection.slot, undefined);
            useUIStore.getState().setSelectedItem(undefined);
          }}
          aria-label="Remove item"
        >
          <Trash2Icon size={12} />
        </button>
      )}
    </div>
  );
};
