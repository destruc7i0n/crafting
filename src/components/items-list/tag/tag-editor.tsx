import { useMemo, useState } from "react";

import { CustomItem, Item, Tag, TagItem } from "@/data/models/types";
import { trackCustomTag } from "@/lib/analytics";
import {
  isValidJavaNamespacedIdentifier,
  javaNamespacedIdentifierHint,
} from "@/lib/minecraft-identifier";
import {
  getDuplicateTagIdErrorMessage,
  hasDuplicateTagId,
  ItemLookup,
  TagContext,
  tagValueKey,
  toTagValue,
} from "@/lib/tags";
import { cn } from "@/lib/utils";
import { useTagStore } from "@/stores/tag";

import { TagValueGrid } from "./tag-value-grid";
import { useFilteredValueOptions } from "./use-filtered-value-options";
import { ValueList, ValueOption } from "./value-list";

interface TagEditorProps {
  tag: Tag;
  customItems: CustomItem[];
  items: Item[];
  lookup?: ItemLookup;
  tagCtx: TagContext;
  vanillaTagItems: TagItem[];
  customTagItems: Record<string, TagItem>;
}

const getTagValueCount = (uid: string) =>
  useTagStore.getState().tags.find((currentTag) => currentTag.uid === uid)?.values.length;

export const TagEditor = ({
  tag,
  customItems,
  items,
  lookup,
  tagCtx,
  vanillaTagItems,
  customTagItems,
}: TagEditorProps) => {
  const tags = useTagStore((state) => state.tags);
  const updateTag = useTagStore((state) => state.updateTag);
  const addValueToTag = useTagStore((state) => state.addValueToTag);
  const removeValueFromTagByIndex = useTagStore((state) => state.removeValueFromTagByIndex);

  const [draftId, setDraftId] = useState(tag.id);
  const [valueSearch, setValueSearch] = useState("");
  const [updateError, setUpdateError] = useState<string>();

  const hasValidDraftId = isValidJavaNamespacedIdentifier(draftId);
  const showDraftIdError = draftId.trim().length > 0 && !hasValidDraftId;
  const duplicateError =
    hasValidDraftId && hasDuplicateTagId(tags, draftId, tag.uid)
      ? getDuplicateTagIdErrorMessage(draftId)
      : undefined;
  const draftIdErrorMessage = showDraftIdError
    ? javaNamespacedIdentifierHint
    : (duplicateError ?? updateError);
  const hasDraftIdError = showDraftIdError || draftIdErrorMessage !== undefined;

  const commitTag = () => {
    if (!hasValidDraftId || duplicateError !== undefined || draftId === tag.id) {
      return;
    }

    try {
      const didUpdate = updateTag(tag.uid, { id: draftId });
      if (didUpdate) {
        trackCustomTag({ action: "update", value_count: tag.values.length });
      }
      setUpdateError(undefined);
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : "Could not update tag");
    }
  };

  const handleAddValue = (option: ValueOption) => {
    const didUpdate = addValueToTag(
      tag.uid,
      toTagValue(option.kind === "item" ? option.item : option.tagItem),
    );

    if (didUpdate) {
      trackCustomTag({ action: "update", value_count: getTagValueCount(tag.uid) ?? 0 });
    }
  };

  const handleRemoveValue = (index: number) => {
    const didUpdate = removeValueFromTagByIndex(tag.uid, index);

    if (didUpdate) {
      trackCustomTag({ action: "update", value_count: getTagValueCount(tag.uid) ?? 0 });
    }
  };

  const eligibleCustomTagItems = useMemo(
    () =>
      tags
        .filter((t) => t.uid !== tag.uid)
        .map((t) => customTagItems[t.uid])
        .filter(Boolean),
    [tags, tag.uid, customTagItems],
  );

  const filteredValues = useFilteredValueOptions({
    customItems,
    items,
    vanillaTagItems,
    customTagItems: eligibleCustomTagItems,
    valueSearch,
  });

  const existingValueIds = useMemo(() => new Set(tag.values.map(tagValueKey)), [tag.values]);

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
            aria-invalid={hasDraftIdError}
            className={cn(
              "border-input bg-background text-foreground focus:ring-ring rounded-md border px-3 py-2 text-sm outline-hidden focus:ring-2 focus:ring-inset",
              hasDraftIdError && "border-destructive focus:ring-destructive",
            )}
            onBlur={commitTag}
            onChange={(event) => {
              setDraftId(event.target.value);
              setUpdateError(undefined);
            }}
          />
          {draftIdErrorMessage && (
            <span className="text-destructive text-[10px]">{draftIdErrorMessage}</span>
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
          lookup={lookup}
          tagCtx={tagCtx}
          onClick={handleRemoveValue}
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
