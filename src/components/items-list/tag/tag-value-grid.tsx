import { CyclingItemPreview } from "@/components/item/cycling-item-preview";
import { ItemPreview } from "@/components/item/item-preview";
import { ItemTooltip } from "@/components/tooltip/item-tooltip";
import { NoTextureTexture } from "@/data/constants";
import { getFullId, getRawId } from "@/data/models/identifier/utilities";
import { Item, TagValue } from "@/data/models/types";
import {
  getCustomTagIdentifier,
  getTagLabel,
  resolveTagValues,
  TagContext,
  tagValueKey,
} from "@/lib/tags";

import { Slot } from "../../slot/slot";

interface TagValueGridProps {
  values: TagValue[];
  itemsById?: Record<string, Item>;
  tagCtx: TagContext;
  onClick: (index: number) => void;
}

type ValuePresentation = {
  label: string;
  description: string;
  /** set for a value that shows a single fixed texture; otherwise the preview cycles itemIds */
  texture?: string;
  itemIds: string[];
};

const presentValue = (
  value: TagValue,
  tagCtx: TagContext,
  itemsById?: Record<string, Item>,
): ValuePresentation => {
  switch (value.type) {
    case "item": {
      const rawId = getRawId(value.id);
      const item = itemsById?.[rawId];

      return {
        label: item?.displayName ?? rawId,
        description: getFullId(value.id),
        texture: item?.texture,
        itemIds: [rawId],
      };
    }
    case "tag": {
      const rawId = getRawId(value.id);

      return {
        label: getTagLabel(rawId),
        description: getFullId(value.id),
        itemIds: resolveTagValues([value], tagCtx),
      };
    }
    case "custom_tag": {
      const tag = tagCtx.tagsByUid[value.uid];

      return tag
        ? {
            label: getTagLabel(getRawId(getCustomTagIdentifier(tag))),
            description: tag.id,
            itemIds: resolveTagValues([value], tagCtx),
          }
        : {
            label: "Missing custom tag",
            description: "This custom tag no longer exists",
            texture: NoTextureTexture,
            itemIds: [],
          };
    }
  }
};

export const TagValueGrid = ({ values, itemsById, tagCtx, onClick }: TagValueGridProps) => {
  if (values.length === 0) {
    return <p className="text-muted-foreground text-sm">None.</p>;
  }

  return (
    <div className="flex flex-wrap">
      {values.map((value, index) => {
        const { label, description, texture, itemIds } = presentValue(value, tagCtx, itemsById);

        return (
          <ItemTooltip
            key={`${tagValueKey(value)}-${index}`}
            title={label}
            description={description}
          >
            <button type="button" className="relative" onClick={() => onClick(index)}>
              <Slot>
                {texture ? (
                  <ItemPreview alt={label} texture={texture} />
                ) : (
                  <CyclingItemPreview alt={label} itemIds={itemIds} />
                )}
              </Slot>
            </button>
          </ItemTooltip>
        );
      })}
    </div>
  );
};
