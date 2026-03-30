import { useRef, useState } from "react";

import { RecipeSlot } from "@/data/types";
import { useResolvedSlotItem } from "@/hooks/use-resolved-tag-item";
import { canEditRecipeSlotCount } from "@/lib/recipe-slots";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipeSlot, selectCurrentRecipeType } from "@/stores/recipe/selectors";

import { ItemCount } from "./item-count";

type EditableItemCountProps = {
  slot: RecipeSlot;
};

export const EditableItemCount = ({ slot }: EditableItemCountProps) => {
  const recipeType = useRecipeStore(selectCurrentRecipeType);
  const rawSlotValue = useRecipeStore(selectCurrentRecipeSlot(slot));
  const slotValue = useResolvedSlotItem(rawSlotValue);
  const setRecipeSlotCount = useRecipeStore((state) => state.setRecipeSlotCount);
  const [editingCount, setEditingCount] = useState(false);
  const [countDraft, setCountDraft] = useState("1");
  const cancelledRef = useRef(false);

  const canEditCount = recipeType ? canEditRecipeSlotCount(recipeType, slot) : false;

  if (!canEditCount || !slotValue || slotValue.type === "tag_item") {
    return null;
  }

  const count = slotValue.count ?? 1;

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
        className="border-input bg-background text-foreground focus:ring-ring absolute right-1 bottom-1 z-20 h-6 w-12 rounded border px-1 text-right text-xs outline-hidden focus:ring-2 focus:ring-inset"
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
        className="pointer-events-auto right-[6px] bottom-[6px] cursor-pointer"
      />
      <span className="sr-only">Edit result count</span>
    </button>
  );
};
