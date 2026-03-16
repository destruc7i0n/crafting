import { memo, useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { centerUnderPointer } from "@atlaskit/pragmatic-drag-and-drop/element/center-under-pointer";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { preventUnhandled } from "@atlaskit/pragmatic-drag-and-drop/prevent-unhandled";
import invariant from "tiny-invariant";

import { getFullId, getRawId } from "@/data/models/identifier/utilities";
import { cloneItem } from "@/data/models/item/utilities";
import { IngredientItem } from "@/data/models/types";
import { useIsTouchDevice } from "@/hooks/use-is-touch-device";
import { ItemDraggableContainer, ItemDraggableData } from "@/lib/dnd";
import { findFirstEmptyRecipeSlot } from "@/lib/recipe-slots";
import { isSameIngredient } from "@/lib/tags";
import { cn } from "@/lib/utils";
import { useRecipeStore } from "@/stores/recipe";
import { useUIStore } from "@/stores/ui";

import { ItemTooltip } from "../tooltip/item-tooltip";
import { CyclingItemPreview } from "./cycling-item-preview";
import { ItemCount } from "./item-count";
import { ItemPreview } from "./item-preview";

type IngredientProps = {
  item: IngredientItem;
  showCount?: boolean;
  container: ItemDraggableContainer;
};

export const Item = memo(({ item, container, showCount }: IngredientProps) => {
  const ref = useRef<HTMLImageElement | null>(null);
  const dndCleanupRef = useRef<(() => void) | null>(null);
  const [dragging, setDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const isTouchDevice = useIsTouchDevice();

  const isSelectedFromIngredients = useUIStore(
    useCallback(
      (state) => container === "ingredients" && isSameIngredient(state.selectedIngredient, item),
      [container, item],
    ),
  );

  const setupDraggable = useCallback(() => {
    if (dndCleanupRef.current) return;

    const el = ref.current;
    invariant(el);

    dndCleanupRef.current = draggable({
      element: el,
      getInitialData: () => ({ type: "item", item, container }) satisfies ItemDraggableData,
      getInitialDataForExternal: () => ({ "text/plain": getRawId(item.id) }),
      onDragStart: () => {
        if (container === "preview") {
          preventUnhandled.start();
        }
        useUIStore.getState().setSelectedIngredient(undefined);
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
  }, [item, container]);

  useEffect(() => {
    if (isTouchDevice) return;

    const el = ref.current;
    if (!el) return;

    const handlePointerDown = () => setupDraggable();
    el.addEventListener("pointerdown", handlePointerDown, { once: true });

    return () => {
      el.removeEventListener("pointerdown", handlePointerDown);
      dndCleanupRef.current?.();
      dndCleanupRef.current = null;
    };
  }, [isTouchDevice, setupDraggable]);

  const handleDoubleClick = () => {
    if (isTouchDevice || container !== "ingredients") return;

    const recipeState = useRecipeStore.getState();
    const currentRecipe = recipeState.recipes[recipeState.selectedRecipeIndex];
    if (!currentRecipe) return;

    const slot = findFirstEmptyRecipeSlot(currentRecipe, item);
    if (!slot) return;

    useRecipeStore.getState().setRecipeSlot(slot, cloneItem(item));
    useUIStore.getState().setSelectedIngredient(undefined);
  };

  const handleClick = () => {
    if (!isTouchDevice || container !== "ingredients") return;
    useUIStore.getState().setSelectedIngredient(item);
  };

  const isTagPreviewActive =
    container === "preview" ||
    (!isTouchDevice && isHovering) ||
    (isTouchDevice && isSelectedFromIngredients);

  const preview =
    item.type === "tag_item" ? (
      <CyclingItemPreview
        alt={item.displayName}
        active={isTagPreviewActive}
        itemIds={item.values}
        ref={ref}
        style={{ opacity: dragging ? 0.5 : 1 }}
        className={cn(
          "touch-action-manipulation",
          !isTouchDevice && "cursor-move",
          isSelectedFromIngredients && "ring-primary rounded ring-2",
        )}
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
        style={{ opacity: dragging ? 0.5 : 1 }}
        className={cn(
          "touch-action-manipulation",
          !isTouchDevice && "cursor-move",
          isSelectedFromIngredients && "ring-primary rounded ring-2",
        )}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      />
    );

  const description = getFullId(item.id);

  return (
    <ItemTooltip title={item.displayName} description={description} visible={!dragging}>
      {preview}
      {showCount && <ItemCount count={item.count ?? 1} />}
    </ItemTooltip>
  );
});
