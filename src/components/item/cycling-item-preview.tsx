import { ComponentPropsWithoutRef, forwardRef, memo, useMemo } from "react";

import { NoTextureTexture } from "@/data/constants";
import { useResourcesForVersion } from "@/hooks/use-resources-for-version";
import { useTagCycleIndex } from "@/hooks/use-tag-cycle-tick";

import { ItemPreview } from "./item-preview";

type CyclingItemPreviewProps = {
  itemIds: string[];
  active?: boolean;
} & Omit<ComponentPropsWithoutRef<typeof ItemPreview>, "texture">;

export const CyclingItemPreview = memo(
  forwardRef<HTMLImageElement, CyclingItemPreviewProps>(
    ({ itemIds, alt, active = true, ...props }, ref) => {
      const { resources } = useResourcesForVersion();

      const visibleItems = useMemo(
        () => itemIds.map((itemId) => resources?.itemsById[itemId]).filter(Boolean),
        [itemIds, resources],
      );

      const cycleIndex = useTagCycleIndex(active ? visibleItems.length : 0);

      const currentTexture =
        visibleItems.length > 0
          ? (visibleItems[active ? cycleIndex : 0]?.texture ?? NoTextureTexture)
          : NoTextureTexture;

      return <ItemPreview {...props} ref={ref} alt={alt} texture={currentTexture} />;
    },
  ),
);

CyclingItemPreview.displayName = "CyclingItemPreview";
