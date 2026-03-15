import { ComponentPropsWithoutRef, memo, useRef } from "react";

import { useResourcesForVersion } from "@/hooks/use-resources-for-version";

type ResourceIconProps = Omit<ComponentPropsWithoutRef<"img">, "src"> & {
  itemId: string;
};

export const ResourceIcon = memo(({ itemId, ...props }: ResourceIconProps) => {
  const { resources } = useResourcesForVersion();
  const texture = resources?.itemsById?.[itemId]?.texture;
  const lastTexture = useRef(texture);

  if (texture) {
    lastTexture.current = texture;
  }

  if (!lastTexture.current) {
    return <div className={props.className} />;
  }

  return <img {...props} src={lastTexture.current} />;
});

ResourceIcon.displayName = "ResourceIcon";
