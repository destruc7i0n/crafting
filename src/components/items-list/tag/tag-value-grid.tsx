import { CyclingItemPreview } from "@/components/item/cycling-item-preview";
import { ItemPreview } from "@/components/item/item-preview";
import { ItemTooltip } from "@/components/tooltip/item-tooltip";
import { getFullId, getRawId, identifierUniqueKey } from "@/data/models/identifier/utilities";
import { Item, Tag, TagValue } from "@/data/models/types";
import { getTagLabel, resolveTagValues } from "@/lib/tags";

import { Slot } from "../../slot/slot";

interface TagValueGridProps {
  values: TagValue[];
  tags: Tag[];
  vanillaTags: Record<string, string[]>;
  itemsById?: Record<string, Item>;
  onClick: (index: number) => void;
}

export const TagValueGrid = ({
  values,
  tags,
  vanillaTags,
  itemsById,
  onClick,
}: TagValueGridProps) => {
  if (values.length === 0) {
    return <p className="text-muted-foreground text-sm">None.</p>;
  }

  return (
    <div className="flex flex-wrap">
      {values.map((value, index) => {
        const itemIds =
          value.type === "item"
            ? [identifierUniqueKey(value.id)]
            : resolveTagValues([value], tags, vanillaTags);
        const directItem =
          value.type === "item" ? itemsById?.[identifierUniqueKey(value.id)] : undefined;
        const label =
          value.type === "item"
            ? (directItem?.displayName ?? getRawId(value.id))
            : getTagLabel(getRawId(value.id));

        return (
          <ItemTooltip
            key={`${getRawId(value.id)}-${index}`}
            title={label}
            description={getFullId(value.id)}
          >
            <button type="button" className="relative" onClick={() => onClick(index)}>
              <Slot>
                {value.type === "item" && directItem ? (
                  <ItemPreview alt={directItem.displayName} texture={directItem.texture} />
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
