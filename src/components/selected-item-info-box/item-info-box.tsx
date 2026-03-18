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

const getTitle = (slot: RecipeSlot | undefined, pendingReplace: boolean | undefined) => {
  if (pendingReplace && slot !== undefined) return "Tap the item in the preview to move it";
  if (pendingReplace) return "Tap the item in the preview to overwrite it";
  if (slot !== undefined) return "Selected item (in preview)";
  return "Selected item (from items)";
};

export const ItemInfoBox = ({ item, slot, pendingReplace }: ItemInfoBoxProps) => {
  return (
    <div className={`border-border bg-background/90 flex flex-col rounded-md border px-3 py-2 text-xs leading-tight shadow-sm backdrop-blur-sm ${pendingReplace ? "bg-amber-500/5" : ""}`}>
      <div className="text-foreground min-w-0 flex flex-col overflow-hidden">
        <span className={`text-xs leading-tight pb-0.5 ${pendingReplace ? "font-medium text-amber-600 dark:text-amber-400" : "font-medium text-muted-foreground"}`}>
          {getTitle(slot, pendingReplace)}
        </span>
        {item.type === "tag_item" ? (
          <span className="font-medium leading-tight truncate">{getTagLabel(getFullId(item.id))}</span>
        ) : (
          <>
            <span className="font-medium leading-tight truncate">{item.displayName}</span>
            <span className="text-muted-foreground text-xs leading-tight truncate">{getFullId(item.id)}</span>
          </>
        )}
      </div>
      <div className="flex items-center justify-end gap-1 pt-0.5">
        {slot !== undefined && !pendingReplace && (
          <button
            type="button"
            className="text-muted-foreground hover:text-destructive cursor-pointer transition-colors flex items-center gap-1 px-2 py-1"
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
          className={`cursor-pointer transition-colors flex items-center gap-1 px-2 py-1 ${pendingReplace ? "text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300" : "text-muted-foreground hover:text-foreground"}`}
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
