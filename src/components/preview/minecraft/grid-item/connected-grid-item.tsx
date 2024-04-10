import { useEffect, useRef, useState } from "react";

import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import invariant from "tiny-invariant";

import { selectRecipeSlot, useAppSelector } from "@/store/hooks";
import { RecipeSlot } from "@/store/slices/recipeSlice";

import { GridItem } from "./grid-item";
import { Ingredient } from "../../ingredient/ingredient";

type ConnectedGridItemProps = {
  slot: RecipeSlot;
};

export const ConnectedGridItem = ({ slot }: ConnectedGridItemProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  const slotValue = useAppSelector(selectRecipeSlot(slot));

  useEffect(() => {
    const el = ref.current;
    invariant(el);

    return dropTargetForElements({
      element: el,
      getData: () => ({ slot }),
      onDragEnter: () => setIsDraggedOver(true),
      onDragLeave: () => setIsDraggedOver(false),
      onDrop: () => setIsDraggedOver(false),
    });
  }, [slot]);

  return (
    <GridItem ref={ref} hover={isDraggedOver}>
      {slotValue && <Ingredient item={slotValue} container="preview" />}
    </GridItem>
  );
};
