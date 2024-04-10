import { ComponentPropsWithoutRef, forwardRef, memo } from "react";

import { Item } from "@/data/models/item/Item";

type IngredientProps = {
  item: Item;
} & ComponentPropsWithoutRef<"img">;

export const IngredientPreview = memo(
  forwardRef<HTMLImageElement, IngredientProps>(({ item, ...props }, ref) => {
    return (
      <img
        {...props}
        ref={ref}
        src={item.texture}
        alt={item.displayName}
        className="h-[32px] w-[32px] [image-rendering:crisp-edges] [image-rendering:pixelated]"
      />
    );
  }),
);
