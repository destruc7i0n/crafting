import { useEffect, useState } from "react";

import { cloneItem } from "@/data/models/item/utilities";
import { RecipeSlot } from "@/data/types";
import { useIsTouchDevice } from "@/hooks/use-is-touch-device";
import { isItemDraggableData, ItemPreviewDropTargetData } from "@/lib/dnd";
import { canEditRecipeSlotCount, canRecipeSlotAcceptIngredient } from "@/lib/recipe-slots";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe, selectCurrentRecipeSlot } from "@/stores/recipe/selectors";
import { useUIStore } from "@/stores/ui";

import { Item } from "./item";
import { ItemCount } from "./item-count";
import { SlotProps } from "../slot/slot";
import { SlotDropTarget } from "../slot/slot-drop-target";

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
  const slotValue = useRecipeStore(selectCurrentRecipeSlot(slot));
  const setRecipeSlot = useRecipeStore((state) => state.setRecipeSlot);
  const setRecipeSlotCount = useRecipeStore((state) => state.setRecipeSlotCount);
  const selectedIngredient = useUIStore((state) => state.selectedIngredient);
  const setSelectedIngredient = useUIStore((state) => state.setSelectedIngredient);
  const [editingCount, setEditingCount] = useState(false);
  const [countDraft, setCountDraft] = useState("1");

  const canEditCount = currentRecipe
    ? canEditRecipeSlotCount(currentRecipe.recipeType, slot)
    : false;

  useEffect(() => {
    if (!slotValue || slotValue.type === "tag_item") {
      setEditingCount(false);
      setCountDraft("1");
      return;
    }

    setCountDraft(String(slotValue.count ?? 1));
  }, [slotValue]);

  const commitCount = () => {
    if (!slotValue || slotValue.type === "tag_item") {
      setEditingCount(false);
      return;
    }

    const nextCount = Math.min(99, Math.max(1, Number.parseInt(countDraft, 10) || 1));
    setRecipeSlotCount(slot, nextCount);
    setCountDraft(String(nextCount));
    setEditingCount(false);
  };

  return (
    <SlotDropTarget<ItemPreviewDropTargetData>
      data={{ type: "preview", slot }}
      {...props}
      className={`relative ${props.className ?? ""}`.trim()}
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

        if (selectedIngredient) {
          if (!canRecipeSlotAcceptIngredient(slot, selectedIngredient)) {
            return;
          }

          setRecipeSlot(slot, cloneItem(selectedIngredient));
          setSelectedIngredient(undefined);
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
          className="absolute bottom-0 right-0 z-10 h-8 w-8"
          onClick={(event) => {
            event.stopPropagation();
            setEditingCount(true);
            setCountDraft(String(slotValue.count ?? 1));
          }}
        >
          <ItemCount count={slotValue.count ?? 1} className="pointer-events-auto" />
          <span className="sr-only">Edit result count</span>
        </button>
      )}

      {canEditCount && slotValue && slotValue.type !== "tag_item" && editingCount && (
        <input
          autoFocus
          type="number"
          min={1}
          max={99}
          value={countDraft}
          className="absolute bottom-1 right-1 z-20 h-6 w-12 rounded border border-input bg-background px-1 text-right text-xs text-foreground outline-none focus:ring-2 focus:ring-inset focus:ring-ring"
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
