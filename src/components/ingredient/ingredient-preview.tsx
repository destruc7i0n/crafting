import { ComponentPropsWithoutRef, forwardRef, memo } from "react";

import { NoTextureTexture } from "@/data/constants";

type IngredientProps = {
  alt?: string;
  texture?: string;
} & ComponentPropsWithoutRef<"img">;

export const IngredientPreview = memo(
  forwardRef<HTMLImageElement, IngredientProps>(
    ({ texture, alt, ...props }, ref) => {
      return (
        <img
          {...props}
          ref={ref}
          src={texture ?? NoTextureTexture}
          alt={alt}
          className="h-[32px] w-[32px] [-webkit-touch-callout:none] [image-rendering:crisp-edges] [image-rendering:pixelated]"
        />
      );
    },
  ),
);

IngredientPreview.displayName = "IngredientPreview";
