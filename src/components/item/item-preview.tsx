import { ComponentPropsWithoutRef, forwardRef, memo, useEffect, useState } from "react";

import { NoTextureTexture } from "@/data/constants";
import { cn } from "@/lib/utils";

type IngredientProps = {
  alt?: string;
  texture?: string;
} & Omit<ComponentPropsWithoutRef<"img">, "children">;

export const ItemPreview = memo(
  forwardRef<HTMLImageElement, IngredientProps>(
    ({ texture, alt, className, decoding, onError, ...props }, ref) => {
      const resolvedTexture = texture || NoTextureTexture;
      const [failedTexture, setFailedTexture] = useState<string | null>(null);

      useEffect(() => {
        setFailedTexture(null);
      }, [resolvedTexture]);

      const src = failedTexture === resolvedTexture ? NoTextureTexture : resolvedTexture;

      return (
        <img
          {...props}
          ref={ref}
          src={src}
          alt={alt}
          decoding={decoding ?? "async"}
          onError={(event) => {
            if (src !== NoTextureTexture) {
              setFailedTexture(resolvedTexture);
            }
            onError?.(event);
          }}
          className={cn(
            "h-[32px] w-[32px] select-none [-webkit-touch-callout:none] [image-rendering:crisp-edges] [image-rendering:pixelated]",
            className,
          )}
        />
      );
    },
  ),
);

ItemPreview.displayName = "ItemPreview";
