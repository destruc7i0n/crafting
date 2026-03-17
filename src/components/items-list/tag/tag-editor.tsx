import { useMemo, useRef, useState } from "react";

import { CyclingItemPreview } from "@/components/item/cycling-item-preview";
import { ItemPreview } from "@/components/item/item-preview";
import { ItemTooltip } from "@/components/tooltip/item-tooltip";
import { getFullId, getRawId, identifierUniqueKey } from "@/data/models/identifier/utilities";
import { Item, Tag, TagItem } from "@/data/models/types";
import {
  isValidJavaNamespacedIdentifier,
  javaNamespacedIdentifierHint,
} from "@/lib/minecraft-identifier";
import { getTagLabel, resolveTagValues } from "@/lib/tags";
import { cn } from "@/lib/utils";
import { useTagStore } from "@/stores/tag";

import { Slot } from "../../slot/slot";
import { ValueList, ValueOption } from "./value-list";

interface TagEditorProps {
  tag: Tag;
  items: Item[];
  itemsById?: Record<string, Item>;
  vanillaTagItems: TagItem[];
  customTagItems: Record<string, TagItem>;
  vanillaTags: Record<string, string[]>;
}

export const TagEditor = ({
  tag,
  items,
  itemsById,
  vanillaTagItems,
  customTagItems,
  vanillaTags,
}: TagEditorProps) => {
  const tags = useTagStore((state) => state.tags);
  const updateTag = useTagStore((state) => state.updateTag);
  const addValueToTag = useTagStore((state) => state.addValueToTag);
  const removeValueFromTagByIndex = useTagStore((state) => state.removeValueFromTagByIndex);

  const [draftId, setDraftId] = useState(tag.id);
  const [valueSearch, setValueSearch] = useState("");
  const prevUidRef = useRef(tag.uid);

  if (prevUidRef.current !== tag.uid) {
    prevUidRef.current = tag.uid;
    setDraftId(tag.id);
    setValueSearch("");
  }

  const showDraftIdError = draftId.trim().length > 0 && !isValidJavaNamespacedIdentifier(draftId);

  const commitTag = () => {
    if (!isValidJavaNamespacedIdentifier(draftId)) {
      return;
    }

    updateTag(tag.uid, { id: draftId });
  };

  const handleAddValue = (option: ValueOption) => {
    if (option.kind === "item") {
      addValueToTag(tag.uid, { type: "item", id: option.item.id });
    } else {
      addValueToTag(tag.uid, { type: "tag", id: option.tagItem.id });
    }
  };

  const filteredValues = useMemo((): ValueOption[] => {
    const normalized = valueSearch.trim().toLowerCase();
    const options: ValueOption[] = [];

    for (const item of items) {
      if (
        !normalized ||
        item.displayName.toLowerCase().includes(normalized) ||
        getRawId(item.id).toLowerCase().includes(normalized)
      ) {
        options.push({ kind: "item", item });
      }
    }

    const allTagItems = [
      ...vanillaTagItems,
      ...tags
        .filter((t) => t.uid !== tag.uid)
        .map((t) => customTagItems[t.uid])
        .filter(Boolean),
    ];

    for (const tagItem of allTagItems) {
      if (
        !normalized ||
        getRawId(tagItem.id).toLowerCase().includes(normalized) ||
        tagItem.displayName.toLowerCase().includes(normalized)
      ) {
        options.push({ kind: "tag", tagItem, rawId: getRawId(tagItem.id) });
      }
    }

    return options;
  }, [valueSearch, items, vanillaTagItems, tags, customTagItems, tag.uid]);

  const existingValueIds = useMemo(
    () => new Set(tag.values.map((v) => identifierUniqueKey(v.id))),
    [tag.values],
  );

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="text-muted-foreground flex flex-col gap-1 text-xs">
          Id
          <input
            value={draftId}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="namespace:tag_name"
            aria-invalid={showDraftIdError}
            className={cn(
              "border-input bg-background text-foreground focus:ring-ring rounded-md border px-3 py-2 text-sm outline-hidden focus:ring-2 focus:ring-inset",
              showDraftIdError && "border-destructive focus:ring-destructive",
            )}
            onBlur={commitTag}
            onChange={(event) => setDraftId(event.target.value)}
          />
          {showDraftIdError && (
            <span className="text-destructive text-[10px]">{javaNamespacedIdentifierHint}</span>
          )}
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-foreground text-xs font-medium">Values</span>
          <span className="text-muted-foreground text-xs">{tag.values.length}</span>
        </div>

        {tag.values.length > 0 ? (
          <div className="flex flex-wrap">
            {tag.values.map((value, index) => {
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
                  <button
                    type="button"
                    className="relative"
                    onClick={() => removeValueFromTagByIndex(tag.uid, index)}
                  >
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
        ) : (
          <p className="text-muted-foreground text-sm">
            No values yet. Search below to add items or tags.
          </p>
        )}
      </div>

      <ValueList
        values={filteredValues}
        valueSearch={valueSearch}
        existingValueIds={existingValueIds}
        onSearchChange={setValueSearch}
        onAdd={handleAddValue}
      />
    </div>
  );
};
