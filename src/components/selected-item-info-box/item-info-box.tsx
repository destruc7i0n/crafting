import { Trash2Icon, XIcon } from "lucide-react";

import { getFullId } from "@/data/models/identifier/utilities";
import { IngredientItem } from "@/data/models/types";
import { RecipeSlot } from "@/data/types";
import { getTagLabel } from "@/lib/tags";
import { useRecipeStore } from "@/stores/recipe";
import { useUIStore } from "@/stores/ui";

type ItemInfoBoxProps =
  | { item: IngredientItem; slot?: undefined; pendingReplace?: boolean }
  | { item: IngredientItem; slot: RecipeSlot; pendingReplace?: boolean };

const getTitle = (
  item: IngredientItem,
  slot: RecipeSlot | undefined,
  pendingReplace: boolean | undefined,
) => {
  if (pendingReplace && slot !== undefined) return "Tap again to move";
  if (pendingReplace) return "Tap again to overwrite";

  const itemType = item.type === "tag_item" ? "tag" : "item";
  if (slot !== undefined) return `Selected ${itemType} (in preview)`;
  return `Selected ${itemType} (from ${itemType === "tag" ? "tags" : "items"})`;
};

export const ItemInfoBox = ({ item, slot, pendingReplace }: ItemInfoBoxProps) => {
  return (
    <div
      className={`border-border bg-background/90 flex flex-col rounded-md border px-3 py-2 text-xs leading-tight shadow-sm backdrop-blur-sm ${pendingReplace ? "bg-amber-500/5" : ""}`}
    >
      <div className="text-foreground flex min-w-0 flex-col overflow-hidden">
        <span
          className={`pb-0.5 text-xs leading-tight ${pendingReplace ? "font-medium text-amber-600 dark:text-amber-400" : "text-muted-foreground font-medium"}`}
        >
          {getTitle(item, slot, pendingReplace)}
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
      <div className="flex items-center justify-end gap-1 pt-0.5">
        {slot !== undefined && !pendingReplace && (
          <button
            type="button"
            className="text-muted-foreground hover:text-destructive flex cursor-pointer items-center gap-1 px-2 py-1 transition-colors"
            onClick={() => {
              useRecipeStore.getState().setRecipeSlot(slot, undefined);
              useUIStore.getState().setSelectedIngredient(undefined);
            }}
            aria-label="Remove item from slot"
          >
            <Trash2Icon size={14} />
            <span>Remove</span>
          </button>
        )}
        <button
          type="button"
          className={`flex cursor-pointer items-center gap-1 px-2 py-1 transition-colors ${pendingReplace ? "text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300" : "text-muted-foreground hover:text-foreground"}`}
          onClick={() => useUIStore.getState().setSelectedIngredient(undefined)}
          aria-label="Deselect"
        >
          <XIcon size={14} />
          <span>Deselect</span>
        </button>
      </div>
    </div>
  );
};
