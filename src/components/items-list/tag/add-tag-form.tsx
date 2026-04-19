import { useMemo, useState } from "react";

import { ArrowLeftIcon } from "lucide-react";

import { identifierUniqueKey } from "@/data/models/identifier/utilities";
import { Item, TagItem, TagValue } from "@/data/models/types";
import {
  isValidJavaNamespacedIdentifier,
  javaNamespacedIdentifierHint,
} from "@/lib/minecraft-identifier";
import { getDuplicateTagIdErrorMessage, hasDuplicateTagId } from "@/lib/tags";
import { cn } from "@/lib/utils";
import { useTagStore } from "@/stores/tag";

import { TagValueGrid } from "./tag-value-grid";
import { useFilteredValueOptions } from "./use-filtered-value-options";
import { ValueList, ValueOption } from "./value-list";

interface AddTagFormProps {
  onClose: () => void;
  items: Item[];
  itemsById?: Record<string, Item>;
  vanillaTagItems: TagItem[];
  customTagItems: Record<string, TagItem>;
  vanillaTags: Record<string, string[]>;
}

export const AddTagForm = ({
  onClose,
  items,
  itemsById,
  vanillaTagItems,
  customTagItems,
  vanillaTags,
}: AddTagFormProps) => {
  const tags = useTagStore((state) => state.tags);
  const createTag = useTagStore((state) => state.createTag);

  const [tagId, setTagId] = useState("");
  const [valueSearch, setValueSearch] = useState("");
  const [draftValues, setDraftValues] = useState<TagValue[]>([]);
  const [submitError, setSubmitError] = useState<string>();

  const hasValidTagId = isValidJavaNamespacedIdentifier(tagId);
  const showTagIdError = tagId.trim().length > 0 && !hasValidTagId;
  const duplicateError =
    hasValidTagId && hasDuplicateTagId(tags, tagId)
      ? getDuplicateTagIdErrorMessage(tagId)
      : undefined;
  const tagIdErrorMessage = showTagIdError
    ? javaNamespacedIdentifierHint
    : (duplicateError ?? submitError);
  const hasTagIdError = showTagIdError || tagIdErrorMessage !== undefined;
  const canCreate = hasValidTagId && duplicateError === undefined && draftValues.length > 0;

  const handleAddValue = (option: ValueOption) => {
    const value: TagValue =
      option.kind === "item"
        ? { type: "item", id: option.item.id }
        : { type: "tag", id: option.tagItem.id };

    setDraftValues((prev) => {
      if (prev.some((v) => identifierUniqueKey(v.id) === identifierUniqueKey(value.id)))
        return prev;
      return [...prev, value];
    });
  };

  const handleRemoveValue = (index: number) => {
    setDraftValues((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreate = () => {
    if (!canCreate) return;

    try {
      createTag({
        id: tagId,
        values: draftValues,
      });
      setSubmitError(undefined);
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not create tag");
    }
  };

  const existingValueIds = useMemo(
    () => new Set(draftValues.map((v) => identifierUniqueKey(v.id))),
    [draftValues],
  );

  const allCustomTagItems = useMemo(
    () => tags.map((t) => customTagItems[t.uid]).filter(Boolean),
    [tags, customTagItems],
  );

  const filteredValues = useFilteredValueOptions({
    items,
    vanillaTagItems,
    customTagItems: allCustomTagItems,
    valueSearch,
  });

  return (
    <div className="scrollbar-app flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer rounded p-1 transition-colors"
          onClick={onClose}
        >
          <ArrowLeftIcon size={16} />
        </button>
        <span className="text-sm font-medium">New Tag</span>
      </div>

      <label className="text-muted-foreground flex flex-col gap-1 text-xs">
        Id
        <input
          value={tagId}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="namespace:tag_name"
          aria-invalid={hasTagIdError}
          className={cn(
            "border-input bg-background text-foreground focus:ring-ring rounded-md border px-3 py-2 text-sm outline-hidden focus:ring-2 focus:ring-inset",
            hasTagIdError && "border-destructive focus:ring-destructive",
          )}
          onChange={(event) => {
            setTagId(event.target.value);
            setSubmitError(undefined);
          }}
        />
        {tagIdErrorMessage && (
          <span className="text-destructive text-[10px]">{tagIdErrorMessage}</span>
        )}
      </label>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-foreground text-xs font-medium">Values</span>
          <span className="text-muted-foreground text-xs">{draftValues.length}</span>
        </div>

        <TagValueGrid
          values={draftValues}
          tags={tags}
          vanillaTags={vanillaTags}
          itemsById={itemsById}
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

      <button
        type="button"
        disabled={!canCreate}
        onClick={handleCreate}
        className="border-border text-foreground hover:bg-accent cursor-pointer rounded-md border px-3 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        Create Tag
      </button>
    </div>
  );
};
