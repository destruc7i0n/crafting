import { ComponentPropsWithoutRef, memo, useRef } from "react";

import { useResourcesForVersion } from "@/hooks/use-resources-for-version";
import { resolveItemId } from "@/lib/resolve-item-id";

import { ItemPreview } from "./item-preview";

type ResourceIconProps = Omit<ComponentPropsWithoutRef<"img">, "src"> & {
  itemId: string;
};

export const ResourceIcon = memo(({ itemId, ...props }: ResourceIconProps) => {
  const { version, resources } = useResourcesForVersion();
  const resolvedId = resolveItemId(itemId, version)?.id;
  const texture = resolvedId ? resources?.itemsById?.[resolvedId]?.texture : undefined;
  const lastTexture = useRef(texture);

  if (texture) {
    lastTexture.current = texture;
  }

  if (!lastTexture.current) {
    return <div className={props.className} />;
  }

  return <ItemPreview {...props} texture={lastTexture.current} />;
});

ResourceIcon.displayName = "ResourceIcon";
