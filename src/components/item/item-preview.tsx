import { ComponentPropsWithoutRef, forwardRef, memo } from "react";

import { NoTextureTexture } from "@/data/constants";
import { cn } from "@/lib/utils";

type IngredientProps = {
  alt?: string;
  texture?: string;
} & Omit<ComponentPropsWithoutRef<"img">, "children">;

export const ItemPreview = memo(
  forwardRef<HTMLImageElement, IngredientProps>(
    ({ texture, alt, className, ...props }, ref) => {
      return (
        <img
          {...props}
          ref={ref}
          src={texture ?? NoTextureTexture}
          alt={alt}
          className={cn(
            "h-[32px] w-[32px] [-webkit-touch-callout:none] [image-rendering:crisp-edges] [image-rendering:pixelated]",
            className,
          )}
        />
      );
    },
  ),
);

ItemPreview.displayName = "ItemPreview";
