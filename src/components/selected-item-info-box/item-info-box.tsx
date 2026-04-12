import { Trash2Icon, XIcon } from "lucide-react";

import { getFullId } from "@/data/models/identifier/utilities";
import { IngredientItem } from "@/data/models/types";
import { useSlotContext } from "@/hooks/use-slot-context";
import { clearRecipeSlotAndSelection } from "@/lib/editor-actions";
import { getTagLabel } from "@/lib/tags";
import { RecipeSlot } from "@/recipes/slots";
import { getSlotDisplay, getSlotIdentifier, isTagSlotValue } from "@/stores/recipe/slot-value";
import { RecipeSlotValue } from "@/stores/recipe/types";
import { useUIStore } from "@/stores/ui";

type ItemInfoBoxProps =
  | { item: IngredientItem; slot?: undefined }
  | { value: RecipeSlotValue; slot: RecipeSlot };

const getTitle = (isTag: boolean, slot: RecipeSlot | undefined) => {
  const itemType = isTag ? "tag" : "item";
  if (slot !== undefined) return `Selected ${itemType} (in recipe)`;
  return `Selected ${itemType} (from ${itemType === "tag" ? "tags" : "items"})`;
};

export const ItemInfoBox = (props: ItemInfoBoxProps) => {
  const slotContext = useSlotContext();

  const isSlotSelection = "value" in props;
  const isTag = isSlotSelection ? isTagSlotValue(props.value) : props.item.type === "tag_item";

  const title = getTitle(isTag, isSlotSelection ? props.slot : undefined);
  const display = isSlotSelection ? getSlotDisplay(props.value, slotContext) : undefined;
  const identifier = isSlotSelection ? getSlotIdentifier(props.value, slotContext) : undefined;

  const content = (() => {
    if (isSlotSelection) {
      return (
        <>
          <span className="truncate leading-tight font-medium">{display?.label}</span>
          <span className="text-muted-foreground truncate text-xs leading-tight">
            {identifier ? getFullId(identifier) : "Missing reference"}
          </span>
        </>
      );
    }

    if (props.item.type === "tag_item") {
      return (
        <span className="truncate leading-tight font-medium">
          {getTagLabel(getFullId(props.item.id))}
        </span>
      );
    }

    return (
      <>
        <span className="truncate leading-tight font-medium">{props.item.displayName}</span>
        <span className="text-muted-foreground truncate text-xs leading-tight">
          {getFullId(props.item.id)}
        </span>
      </>
    );
  })();

  return (
    <div className="border-border bg-background/90 flex flex-col rounded-md border px-2 py-1.5 text-xs leading-tight shadow-sm backdrop-blur-sm sm:px-3 sm:py-2">
      <div className="text-foreground flex min-w-0 flex-col overflow-hidden">
        <span className="text-muted-foreground truncate pb-0.5 text-xs leading-tight font-medium">
          {title}
        </span>
        {content}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-1 pt-0.5 sm:flex-nowrap sm:pt-0.5">
        {isSlotSelection && (
          <button
            type="button"
            className="text-muted-foreground hover:text-destructive flex cursor-pointer items-center gap-1 px-1 py-0.5 text-xs transition-colors sm:px-2 sm:py-1"
            onClick={() => clearRecipeSlotAndSelection(props.slot)}
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
