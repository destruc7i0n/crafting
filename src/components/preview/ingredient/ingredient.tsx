import { useDraggable } from "@dnd-kit/core";

import { Item } from "@/data/models/item/Item";

import { IngredientPreview } from "./ingredient-preview";

type IngredientProps = {
  item: Item;
};

export const Ingredient = ({ item }: IngredientProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id.toString(),
    data: {
      type: "item",
      item,
    },
  });

  return (
    <IngredientPreview
      item={item}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        visibility: isDragging ? "hidden" : "visible",
      }}
    />
  );
};
