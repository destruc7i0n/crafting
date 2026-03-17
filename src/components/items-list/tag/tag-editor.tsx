import { useMemo, useRef, useState } from "react";

import { identifierUniqueKey } from "@/data/models/identifier/utilities";
import { Item, Tag, TagItem } from "@/data/models/types";
import {
  isValidJavaNamespacedIdentifier,
  javaNamespacedIdentifierHint,
} from "@/lib/minecraft-identifier";
import { cn } from "@/lib/utils";
import { useTagStore } from "@/stores/tag";

import { TagValueGrid } from "./tag-value-grid";
import { filterValueOptions, ValueList, ValueOption } from "./value-list";

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

  const filteredValues = useMemo(
    () => filterValueOptions(valueSearch, items, vanillaTagItems, tags, customTagItems, tag.uid),
    [valueSearch, items, vanillaTagItems, tags, customTagItems, tag.uid],
  );

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

        <TagValueGrid
          values={tag.values}
          tags={tags}
          vanillaTags={vanillaTags}
          itemsById={itemsById}
          onClick={(index) => removeValueFromTagByIndex(tag.uid, index)}
        />
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
