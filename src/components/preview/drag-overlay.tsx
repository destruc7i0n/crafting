import { DragOverlay, useDndContext } from "@dnd-kit/core";
import { restrictToWindowEdges, snapCenterToCursor } from "@dnd-kit/modifiers";
import { createPortal } from "react-dom";

import { Item } from "@/data/models/item/Item";

import { IngredientPreview } from "./ingredient/ingredient-preview";

export const IngredientDragOverlay = () => {
  const { active } = useDndContext();

  const activeItem = active?.data.current?.item as Item | undefined;

  return createPortal(
    <DragOverlay modifiers={[snapCenterToCursor, restrictToWindowEdges]}>
      {activeItem && <IngredientPreview item={activeItem} />}
    </DragOverlay>,
    document.body,
  );
};
