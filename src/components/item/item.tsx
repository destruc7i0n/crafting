import { memo, useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { centerUnderPointer } from "@atlaskit/pragmatic-drag-and-drop/element/center-under-pointer";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import invariant from "tiny-invariant";

import { getFullId, getRawId } from "@/data/models/identifier/utilities";
import { IngredientItem } from "@/data/models/types";
import { useIsTouchDevice } from "@/hooks/use-is-touch-device";
import { useItemSelection } from "@/hooks/use-item-selection";
import { ItemDraggableData } from "@/lib/dnd";
import { isSameIngredient } from "@/lib/tags";
import { cn } from "@/lib/utils";
import { findFirstEmptyRecipeSlot } from "@/recipes/slots/utils";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe } from "@/stores/recipe/selectors";
import { useUIStore } from "@/stores/ui";

import { ItemTooltip } from "../tooltip/item-tooltip";
import { CyclingItemPreview } from "./cycling-item-preview";
import { ItemCount } from "./item-count";
import { ItemPreview } from "./item-preview";

type IngredientProps = {
  item: IngredientItem;
  showCount?: boolean;
};

export const Item = memo(({ item, showCount }: IngredientProps) => {
  const ref = useRef<HTMLImageElement | null>(null);
  const dndCleanupRef = useRef<(() => void) | null>(null);
  const [dragging, setDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const isTouchDevice = useIsTouchDevice();
  const selection = useItemSelection();
  const isSelectedFromIngredients =
    selection?.type === "ingredient" && isSameIngredient(selection.item, item);

  const setupDraggable = useCallback(() => {
    if (dndCleanupRef.current) return;

    const el = ref.current;
    invariant(el);

    dndCleanupRef.current = draggable({
      element: el,
      getInitialData: () => ({ type: "palette-item", item }) satisfies ItemDraggableData,
      getInitialDataForExternal: () => ({ "text/plain": getRawId(item.id) }),
      onDragStart: () => {
        useUIStore.getState().clearInteractionState();
        setDragging(true);
      },
      onDrop: () => setDragging(false),
      onGenerateDragPreview: ({ nativeSetDragImage }) => {
        setCustomNativeDragPreview({
          getOffset: centerUnderPointer,
          render({ container }) {
            const root = createRoot(container);
            root.render(
              item.type === "tag_item" ? (
                <CyclingItemPreview itemIds={item.values} alt={item.displayName} active={false} />
              ) : (
                <ItemPreview texture={item.texture} alt={item.displayName} />
              ),
            );
            return () => root.unmount();
          },
          nativeSetDragImage,
        });
      },
    });
  }, [item]);

  useEffect(() => {
    if (isTouchDevice) return;

    const el = ref.current;
    if (!el) return;

    const handlePointerEnter = () => setupDraggable();
    el.addEventListener("pointerenter", handlePointerEnter, { once: true });

    return () => {
      el.removeEventListener("pointerenter", handlePointerEnter);
      dndCleanupRef.current?.();
      dndCleanupRef.current = null;
    };
  }, [isTouchDevice, setupDraggable]);

  const handleDoubleClick = () => {
    if (isTouchDevice) return;

    const recipeState = useRecipeStore.getState();
    const currentRecipe = selectCurrentRecipe(recipeState);
    if (!currentRecipe) return;

    const slot = findFirstEmptyRecipeSlot(currentRecipe, item);
    if (!slot) return;

    useRecipeStore.getState().setRecipeSlotFromIngredient(slot, item);
    useUIStore.getState().clearInteractionState();
  };

  const handleClick = () => {
    if (!isTouchDevice) return;
    const { selectIngredient, clearInteractionState } = useUIStore.getState();
    if (selection?.type === "ingredient" && isSameIngredient(selection.item, item)) {
      clearInteractionState();
    } else {
      selectIngredient(item);
    }
  };

  const isTagPreviewActive =
    (!isTouchDevice && isHovering) || (isTouchDevice && isSelectedFromIngredients);

  const preview =
    item.type === "tag_item" ? (
      <CyclingItemPreview
        alt={item.displayName}
        active={isTagPreviewActive}
        itemIds={item.values}
        ref={ref}
        draggable={isTouchDevice ? false : undefined}
        style={{ opacity: dragging ? 0.5 : 1 }}
        className={cn("touch-action-manipulation", !isTouchDevice && "cursor-move")}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      />
    ) : (
      <ItemPreview
        alt={item.displayName}
        texture={item.texture}
        ref={ref}
        draggable={isTouchDevice ? false : undefined}
        style={{ opacity: dragging ? 0.5 : 1 }}
        className={cn("touch-action-manipulation", !isTouchDevice && "cursor-move")}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      />
    );

  const description = getFullId(item.id);

  return (
    <ItemTooltip
      title={item.displayName}
      description={description}
      visible={!dragging}
      className={cn(
        "absolute -inset-0.5 flex items-center justify-center",
        isSelectedFromIngredients && "ring-primary z-10 rounded ring-2",
      )}
    >
      {preview}
      {showCount && <ItemCount count={item.count ?? 1} />}
    </ItemTooltip>
  );
});
