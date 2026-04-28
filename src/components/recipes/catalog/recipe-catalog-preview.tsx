import { useCallback } from "react";

import { CyclingItemPreview } from "@/components/item/cycling-item-preview";
import { ItemCount } from "@/components/item/item-count";
import { ItemPreview } from "@/components/item/item-preview";
import {
  CraftingPreviewSurface,
  FurnacePreviewSurface,
  type PreviewSlotRenderer,
  type PreviewSlotRenderOptions,
  SmithingPreviewSurface,
  StonecutterPreviewSurface,
} from "@/components/preview/recipe-preview-surface";
import { Slot } from "@/components/slot/slot";
import { ItemTooltip } from "@/components/tooltip/item-tooltip";
import { NoTextureTexture } from "@/data/constants";
import { getFullId } from "@/data/models/identifier/utilities";
import { getTagLabel } from "@/lib/tags";
import { getRecipeDefinition } from "@/recipes/definitions";

import type { Item } from "@/data/models/types";
import type {
  CatalogSlotAlternative,
  CatalogSlotValue,
  GeneratedRecipeCatalogEntry,
} from "@/recipes/catalog/types";
import type { VersionResourceData } from "@/stores/resources";

type RecipeCatalogPreviewProps = {
  entry: GeneratedRecipeCatalogEntry;
  resources?: VersionResourceData;
};

type CatalogPreviewSlotOptions = {
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

export function RecipeCatalogPreview({ entry, resources }: RecipeCatalogPreviewProps) {
  const renderSlot = useCallback<PreviewSlotRenderer<CatalogSlotValue>>(
    (_slot, value, options) => renderCatalogPreviewSlot({ value, resources, options }),
    [resources],
  );
  const previewKind = getRecipeDefinition(entry.recipeType).previewKind;

  switch (previewKind) {
    case "crafting":
      return (
        <CraftingPreviewSurface slots={entry.slots} renderSlot={renderSlot} twoByTwo={false} />
      );
    case "furnace":
      return (
        <FurnacePreviewSurface slots={entry.slots} renderSlot={renderSlot} fuelDisabled={false} />
      );
    case "stonecutter":
      return <StonecutterPreviewSurface slots={entry.slots} renderSlot={renderSlot} />;
    case "smithing":
      return <SmithingPreviewSurface slots={entry.slots} renderSlot={renderSlot} />;
    default:
      return null;
  }
}

function renderCatalogPreviewSlot({ value, resources, options }: CatalogPreviewSlotOptions) {
  const presentation = value ? getCatalogSlotPresentation(value, resources) : undefined;

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
}

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
