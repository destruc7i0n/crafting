import { useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { RecipeSlot } from "@/recipes/slots";
import { canEditRecipeSlotCount } from "@/recipes/slots/utils";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipeSlot, selectCurrentRecipeType } from "@/stores/recipe/selectors";
import { canEditSlotCount, getSlotCount } from "@/stores/recipe/slot-value";

import { ItemCount } from "./item-count";

type EditableItemCountProps = {
  slot: RecipeSlot;
  compact?: boolean;
};

export const EditableItemCount = ({ slot, compact = false }: EditableItemCountProps) => {
  const recipeType = useRecipeStore(selectCurrentRecipeType);
  const slotValue = useRecipeStore(selectCurrentRecipeSlot(slot));
  const setRecipeSlotCount = useRecipeStore((state) => state.setRecipeSlotCount);
  const [editingCount, setEditingCount] = useState(false);
  const [countDraft, setCountDraft] = useState("1");
  const cancelledRef = useRef(false);

  const canEditCount = recipeType ? canEditRecipeSlotCount(recipeType, slot) : false;

  if (!canEditCount || !canEditSlotCount(slotValue)) {
    return null;
  }

  const count = getSlotCount(slotValue) ?? 1;

  const cancelCount = () => {
    cancelledRef.current = true;
    setCountDraft(String(count));
    setEditingCount(false);
  };

  const commitCount = () => {
    if (cancelledRef.current) {
      cancelledRef.current = false;
      return;
    }
    const parsed = Number.parseInt(countDraft, 10);
    if (Number.isNaN(parsed)) {
      cancelCount();
      return;
    }
    const nextCount = Math.min(64, Math.max(1, parsed));
    setRecipeSlotCount(slot, nextCount);
    setCountDraft(String(nextCount));
    setEditingCount(false);
  };

  if (editingCount) {
    return (
      <input
        autoFocus
        type="number"
        min={1}
        max={64}
        value={countDraft}
        className={cn(
          "border-input bg-background text-foreground focus:ring-ring absolute z-20 rounded border px-1 text-right text-xs outline-hidden focus:ring-2 focus:ring-inset",
          compact ? "right-0.5 bottom-0.5 h-5 w-10" : "right-1 bottom-1 h-6 w-12",
        )}
        onBlur={commitCount}
        onChange={(event) => setCountDraft(event.target.value)}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === "Enter") commitCount();
          if (event.key === "Escape") cancelCount();
        }}
      />
    );
  }

  return (
    <button
      type="button"
      className="pointer-events-none absolute right-0 bottom-0 z-10"
      onClick={(event) => {
        event.stopPropagation();
        setEditingCount(true);
        setCountDraft(String(count));
      }}
    >
      <ItemCount
        count={count}
        compact={compact}
        className={cn(
          "pointer-events-auto cursor-pointer",
          compact ? "right-[3px] bottom-[3px]" : "right-[6px] bottom-[6px]",
        )}
      />
      <span className="sr-only">Edit result count</span>
    </button>
  );
};
