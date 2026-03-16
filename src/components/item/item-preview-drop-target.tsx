import { useState } from "react";

import { cloneItem } from "@/data/models/item/utilities";
import { RecipeSlot } from "@/data/types";
import { useIsTouchDevice } from "@/hooks/use-is-touch-device";
import { useResolvedSlotItem } from "@/hooks/use-resolved-tag-item";
import { isItemDraggableData, ItemPreviewDropTargetData } from "@/lib/dnd";
import { canEditRecipeSlotCount, canRecipeSlotAcceptIngredient } from "@/lib/recipe-slots";
import { cn } from "@/lib/utils";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe, selectCurrentRecipeSlot } from "@/stores/recipe/selectors";
import { useUIStore } from "@/stores/ui";

import { SlotProps } from "../slot/slot";
import { SlotDropTarget } from "../slot/slot-drop-target";
import { Item } from "./item";
import { ItemCount } from "./item-count";

type ItemPreviewDropTargetProps = {
  slot: RecipeSlot;
  showCount?: boolean;
} & SlotProps;

export const ItemPreviewDropTarget = ({
  slot,
  showCount = false,
  ...props
}: ItemPreviewDropTargetProps) => {
  const isTouchDevice = useIsTouchDevice();
  const currentRecipe = useRecipeStore(selectCurrentRecipe);
  const rawSlotValue = useRecipeStore(selectCurrentRecipeSlot(slot));
  const slotValue = useResolvedSlotItem(rawSlotValue);
  const setRecipeSlot = useRecipeStore((state) => state.setRecipeSlot);
  const setRecipeSlotCount = useRecipeStore((state) => state.setRecipeSlotCount);
  const [editingCount, setEditingCount] = useState(false);
  const [countDraft, setCountDraft] = useState("1");

  const canEditCount = currentRecipe
    ? canEditRecipeSlotCount(currentRecipe.recipeType, slot)
    : false;

  const commitCount = () => {
    if (!slotValue || slotValue.type === "tag_item") {
      setEditingCount(false);
      return;
    }

    const nextCount = Math.min(64, Math.max(1, Number.parseInt(countDraft, 10) || 1));
    setRecipeSlotCount(slot, nextCount);
    setCountDraft(String(nextCount));
    setEditingCount(false);
  };

  return (
    <SlotDropTarget<ItemPreviewDropTargetData>
      data={{ type: "preview", slot }}
      {...props}
      className={cn("relative", props.className)}
      canDrop={({ source }) => {
        if (isItemDraggableData(source.data)) {
          return canRecipeSlotAcceptIngredient(slot, source.data.item);
        }

        return false;
      }}
      onClick={(event) => {
        props.onClick?.(event);

        if (!isTouchDevice) {
          return;
        }

        const selectedIngredient = useUIStore.getState().selectedIngredient;
        if (selectedIngredient) {
          if (!canRecipeSlotAcceptIngredient(slot, selectedIngredient)) {
            return;
          }

          setRecipeSlot(slot, cloneItem(selectedIngredient));
          useUIStore.getState().setSelectedIngredient(undefined);
        } else if (slotValue) {
          setRecipeSlot(slot, undefined);
        }
      }}
    >
      {slotValue && (
        <Item
          item={slotValue}
          container="preview"
          showCount={showCount && (!canEditCount || slotValue.type === "tag_item")}
        />
      )}

      {canEditCount && slotValue && slotValue.type !== "tag_item" && !editingCount && (
        <button
          type="button"
          className="pointer-events-none absolute right-0 bottom-0 z-10"
          onClick={(event) => {
            event.stopPropagation();
            setEditingCount(true);
            setCountDraft(String(slotValue.count ?? 1));
          }}
        >
          <ItemCount count={slotValue.count ?? 1} className="pointer-events-auto cursor-pointer" />
          <span className="sr-only">Edit result count</span>
        </button>
      )}

      {canEditCount && slotValue && slotValue.type !== "tag_item" && editingCount && (
        <input
          autoFocus
          type="number"
          min={1}
          max={64}
          value={countDraft}
          className="border-input bg-background text-foreground focus:ring-ring absolute right-1 bottom-1 z-20 h-6 w-12 rounded border px-1 text-right text-xs outline-hidden focus:ring-2 focus:ring-inset"
          onBlur={commitCount}
          onChange={(event) => setCountDraft(event.target.value)}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              commitCount();
            }

            if (event.key === "Escape") {
              setCountDraft(String(slotValue.count ?? 1));
              setEditingCount(false);
            }
          }}
        />
      )}
    </SlotDropTarget>
  );
};
