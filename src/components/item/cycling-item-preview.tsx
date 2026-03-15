import { ComponentPropsWithoutRef, forwardRef, memo, useMemo } from "react";

import { NoTextureTexture } from "@/data/constants";
import { useTagCycleIndex } from "@/hooks/use-tag-cycle-tick";
import { useResourcesForVersion } from "@/hooks/use-resources-for-version";

import { ItemPreview } from "./item-preview";

type CyclingItemPreviewProps = {
  itemIds: string[];
} & Omit<ComponentPropsWithoutRef<typeof ItemPreview>, "texture">;

export const CyclingItemPreview = memo(
  forwardRef<HTMLImageElement, CyclingItemPreviewProps>(({ itemIds, alt, ...props }, ref) => {
    const { resources } = useResourcesForVersion();

    const visibleItems = useMemo(
      () => itemIds.map((itemId) => resources?.itemsById[itemId]).filter(Boolean),
      [itemIds, resources],
    );

    const cycleIndex = useTagCycleIndex(visibleItems.length);

    const currentTexture =
      visibleItems.length > 0
        ? (visibleItems[cycleIndex]?.texture ?? NoTextureTexture)
        : NoTextureTexture;

    return <ItemPreview {...props} ref={ref} alt={alt} texture={currentTexture} />;
  }),
);

CyclingItemPreview.displayName = "CyclingItemPreview";
