import { Trash2Icon, XIcon } from "lucide-react";

import { getFullId } from "@/data/models/identifier/utilities";
import { IngredientItem } from "@/data/models/types";
import { RecipeSlot } from "@/data/types";
import { getTagLabel } from "@/lib/tags";
import { useRecipeStore } from "@/stores/recipe";
import { useUIStore } from "@/stores/ui";

type ItemInfoBoxProps =
  | { item: IngredientItem; slot?: undefined }
  | { item: IngredientItem; slot: RecipeSlot };

const getTitle = (item: IngredientItem, slot: RecipeSlot | undefined) => {
  const itemType = item.type === "tag_item" ? "tag" : "item";
  if (slot !== undefined) return `Selected ${itemType} (in preview)`;
  return `Selected ${itemType} (from ${itemType === "tag" ? "tags" : "items"})`;
};

export const ItemInfoBox = ({ item, slot }: ItemInfoBoxProps) => {
  return (
    <div className="border-border bg-background/90 flex flex-col rounded-md border px-2 py-1.5 text-xs leading-tight shadow-sm backdrop-blur-sm sm:px-3 sm:py-2">
      <div className="text-foreground flex min-w-0 flex-col overflow-hidden">
        <span className="text-muted-foreground truncate pb-0.5 text-xs leading-tight font-medium">
          {getTitle(item, slot)}
        </span>
        {item.type === "tag_item" ? (
          <span className="truncate leading-tight font-medium">
            {getTagLabel(getFullId(item.id))}
          </span>
        ) : (
          <>
            <span className="truncate leading-tight font-medium">{item.displayName}</span>
            <span className="text-muted-foreground truncate text-xs leading-tight">
              {getFullId(item.id)}
            </span>
          </>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-1 pt-0.5 sm:flex-nowrap sm:pt-0.5">
        {slot !== undefined && (
          <button
            type="button"
            className="text-muted-foreground hover:text-destructive flex cursor-pointer items-center gap-1 px-1 py-0.5 text-xs transition-colors sm:px-2 sm:py-1"
            onClick={() => {
              useRecipeStore.getState().setRecipeSlot(slot, undefined);
              useUIStore.getState().setSelection(undefined);
            }}
            aria-label="Remove item from slot"
          >
            <Trash2Icon size={14} />
            <span>Remove</span>
          </button>
        )}
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1 px-1 py-0.5 text-xs transition-colors sm:px-2 sm:py-1"
          onClick={() => useUIStore.getState().setSelection(undefined)}
          aria-label="Deselect"
        >
          <XIcon size={14} />
          <span>Deselect</span>
        </button>
      </div>
    </div>
  );
};
