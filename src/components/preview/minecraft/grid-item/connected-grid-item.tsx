import { useDroppable } from "@dnd-kit/core";

import { selectRecipeSlot, useAppSelector } from "@/store/hooks";
import { RecipeSlot } from "@/store/slices/recipeSlice";

import { GridItem } from "./grid-item";
import { IngredientPreview } from "../../ingredient/ingredient-preview";

type ConnectedGridItemProps = {
  slot: RecipeSlot;
};

export const ConnectedGridItem = ({ slot }: ConnectedGridItemProps) => {
  const slotValue = useAppSelector(selectRecipeSlot(slot));

  const { setNodeRef, isOver } = useDroppable({
    id: slot,
  });

  return (
    <GridItem ref={setNodeRef} hover={isOver}>
      {slotValue && <IngredientPreview item={slotValue} />}
    </GridItem>
  );
};
