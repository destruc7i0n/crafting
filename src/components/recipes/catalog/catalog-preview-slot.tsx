import { memo, useMemo } from "react";

import { CyclingItemPreview } from "@/components/item/cycling-item-preview";
import { ItemCount } from "@/components/item/item-count";
import { ItemPreview } from "@/components/item/item-preview";
import { Slot } from "@/components/slot/slot";
import { ItemTooltip } from "@/components/tooltip/item-tooltip";
import { NoTextureTexture } from "@/data/constants";
import { getFullId } from "@/data/models/identifier/utilities";
import { getTagLabel } from "@/lib/tags";

import type { PreviewSlotRenderOptions } from "@/components/preview/recipe-preview-surface";
import type { Item } from "@/data/models/types";
import type { CatalogSlotAlternative, CatalogSlotValue } from "@/recipes/catalog/types";
import type { RecipeSlot } from "@/recipes/slots";
import type { VersionResourceData } from "@/stores/resources";

type CatalogPreviewSlotProps = {
  slot: RecipeSlot;
  value?: CatalogSlotValue;
  resources?: VersionResourceData;
  options?: PreviewSlotRenderOptions;
};

type BaseCatalogSlotPresentation = {
  label: string;
  description: string;
  count?: number;
};

type StaticCatalogSlotPresentation = BaseCatalogSlotPresentation & {
  preview: { kind: "item"; texture: string };
};

type CyclingCatalogSlotPresentation = BaseCatalogSlotPresentation & {
  preview: { kind: "cycling"; itemIds: string[] };
};

type CatalogSlotPresentation = StaticCatalogSlotPresentation | CyclingCatalogSlotPresentation;

export const CatalogPreviewSlot = memo(function CatalogPreviewSlot({
  value,
  resources,
  options,
}: CatalogPreviewSlotProps) {
  const presentation = useMemo(
    () => (value ? getCatalogSlotPresentation(value, resources) : undefined),
    [resources, value],
  );

  if (!presentation) {
    return <Slot inert width={options?.width} height={options?.height} className="relative" />;
  }

  if (isCyclingPresentation(presentation)) {
    return (
      <Slot inert width={options?.width} height={options?.height} className="relative">
        <CyclingItemPreview
          alt={presentation.label}
          itemIds={presentation.preview.itemIds}
          itemsById={resources?.itemsById}
          draggable={false}
          loading="lazy"
          decoding="async"
          render={({ currentItem, preview }) => (
            <ItemTooltip
              title={getCyclingLabel(currentItem, presentation)}
              description={getCyclingDescription(currentItem, presentation)}
              touchBehavior="tap"
              className="absolute -inset-0.5 flex items-center justify-center"
            >
              {preview}
              {presentation.count && presentation.count > 1 ? (
                <ItemCount count={presentation.count} compact={(options?.width ?? 36) <= 36} />
              ) : null}
            </ItemTooltip>
          )}
        />
      </Slot>
    );
  }

  return (
    <Slot inert width={options?.width} height={options?.height} className="relative">
      <ItemTooltip
        title={presentation.label}
        description={presentation.description}
        touchBehavior="tap"
        className="absolute -inset-0.5 flex items-center justify-center"
      >
        <ItemPreview
          alt={presentation.label}
          texture={presentation.preview.texture}
          draggable={false}
          loading="lazy"
          decoding="async"
        />
        {presentation.count && presentation.count > 1 ? (
          <ItemCount count={presentation.count} compact={(options?.width ?? 36) <= 36} />
        ) : null}
      </ItemTooltip>
    </Slot>
  );
});

CatalogPreviewSlot.displayName = "CatalogPreviewSlot";

function getCyclingLabel(
  currentItem: Item | undefined,
  presentation: CyclingCatalogSlotPresentation,
): string {
  return currentItem?.displayName ?? presentation.label;
}

function getCyclingDescription(
  currentItem: Item | undefined,
  presentation: CyclingCatalogSlotPresentation,
): string {
  return currentItem ? getFullId(currentItem.id) : presentation.description;
}

function isCyclingPresentation(
  presentation: CatalogSlotPresentation,
): presentation is CyclingCatalogSlotPresentation {
  return presentation.preview.kind === "cycling";
}

function getCatalogSlotPresentation(
  value: CatalogSlotValue,
  resources?: VersionResourceData,
): CatalogSlotPresentation {
  if (value.kind === "item") {
    const item = resources?.itemsById[value.id];
    const description = getCatalogResourceDisplayId(value.id);

    return {
      label: item?.displayName ?? value.id,
      description,
      preview: { kind: "item", texture: item?.texture ?? NoTextureTexture },
      count: value.count,
    };
  }

  if (value.kind === "tag") {
    const previewValues = resources?.vanillaTags[value.id] ?? [];
    const description = getCatalogResourceDisplayId(value.id);

    return {
      label: getTagLabel(value.id),
      description,
      preview: { kind: "cycling", itemIds: previewValues },
    };
  }

  const previewValues = getAlternativePreviewValues(value.values, resources);

  return {
    label: "Recipe option",
    description: "Recipe option",
    preview: { kind: "cycling", itemIds: previewValues },
  };
}

function getAlternativePreviewValues(
  values: CatalogSlotAlternative[],
  resources?: VersionResourceData,
): string[] {
  const previewValues = values.flatMap((value) => {
    if (value.kind === "item") {
      return [value.id];
    }

    return resources?.vanillaTags[value.id] ?? [];
  });

  return [...new Set(previewValues)];
}

function getCatalogResourceDisplayId(id: string): string {
  return id.includes(":") ? id : `minecraft:${id}`;
}
