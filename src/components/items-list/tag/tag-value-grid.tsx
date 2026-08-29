import { CyclingItemPreview } from "@/components/item/cycling-item-preview";
import { ItemPreview } from "@/components/item/item-preview";
import { ItemTooltip } from "@/components/tooltip/item-tooltip";
import { NoTextureTexture } from "@/data/constants";
import { getFullId, getRawId } from "@/data/models/identifier/utilities";
import { TagValue } from "@/data/models/types";
import {
  getCustomTagIdentifier,
  getTagLabel,
  ItemLookup,
  lookupItem,
  resolveTagValues,
  TagContext,
  tagValueKey,
} from "@/lib/tags";

import { Slot } from "../../slot/slot";

interface TagValueGridProps {
  values: TagValue[];
  lookup?: ItemLookup;
  tagCtx: TagContext;
  onClick: (index: number) => void;
}

type ValuePresentation = {
  label: string;
  description: string;
  // set for a value showing one fixed texture; otherwise the preview cycles itemIds
  texture?: string;
  itemIds: string[];
};

const presentValue = (
  value: TagValue,
  tagCtx: TagContext,
  lookup?: ItemLookup,
): ValuePresentation => {
  switch (value.type) {
    case "item": {
      const rawId = getRawId(value.id);
      const item = lookupItem(lookup, rawId);

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
    case "custom_item": {
      const item = tagCtx.customItemsByUid[value.uid];

      return item
        ? {
            label: item.displayName,
            description: getFullId(item.id),
            texture: item.texture,
            itemIds: [getRawId(item.id)],
          }
        : {
            label: "Missing custom item",
            description: "This custom item no longer exists",
            texture: NoTextureTexture,
            itemIds: [],
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
    default:
      // a value shape this build does not know; render it rather than crash the grid
      return {
        label: "Unknown value",
        description: "This value is not supported in this version of the editor",
        texture: NoTextureTexture,
        itemIds: [],
      };
  }
};

export const TagValueGrid = ({ values, lookup, tagCtx, onClick }: TagValueGridProps) => {
  if (values.length === 0) {
    return <p className="text-muted-foreground text-sm">None.</p>;
  }

  return (
    <div className="flex flex-wrap">
      {values.map((value, index) => {
        const { label, description, texture, itemIds } = presentValue(value, tagCtx, lookup);

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
