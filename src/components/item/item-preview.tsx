import { ComponentPropsWithoutRef, forwardRef, memo } from "react";

import { NoTextureTexture } from "@/data/constants";
import { cn } from "@/lib/utils";

type IngredientProps = {
  alt?: string;
  texture?: string;
} & Omit<ComponentPropsWithoutRef<"img">, "children">;

export const ItemPreview = memo(
  forwardRef<HTMLImageElement, IngredientProps>(
    ({ texture, alt, className, decoding, onError, ...props }, ref) => (
      <img
        {...props}
        ref={ref}
        src={texture || NoTextureTexture}
        alt={alt}
        decoding={decoding ?? "async"}
        onError={(event) => {
          if (event.currentTarget.src !== NoTextureTexture) {
            event.currentTarget.src = NoTextureTexture;
          }
          onError?.(event);
        }}
        className={cn(
          "h-[32px] w-[32px] select-none [-webkit-touch-callout:none] [image-rendering:crisp-edges] [image-rendering:pixelated]",
          className,
        )}
      />
    ),
  ),
);

ItemPreview.displayName = "ItemPreview";
