import { useMemo, useState } from "react";

import { ArrowLeftIcon } from "lucide-react";

import { CyclingItemPreview } from "@/components/item/cycling-item-preview";
import { ItemPreview } from "@/components/item/item-preview";
import { ItemTooltip } from "@/components/tooltip/item-tooltip";
import { parseStringToMinecraftIdentifier } from "@/data/models/identifier/utilities";
import { Item, TagItem, TagValue } from "@/data/models/types";
import {
  isValidJavaNamespacedIdentifier,
  javaNamespacedIdentifierHint,
} from "@/lib/minecraft-identifier";
import { getTagLabel, resolveTagValues } from "@/lib/tags";
import { cn } from "@/lib/utils";
import { useTagStore } from "@/stores/tag";

import { Slot } from "../../slot/slot";
import { MemberCandidate, MemberCandidateList } from "./member-candidate-list";

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
  const [memberSearch, setMemberSearch] = useState("");
  const [draftValues, setDraftValues] = useState<TagValue[]>([]);

  const showTagIdError = tagId.trim().length > 0 && !isValidJavaNamespacedIdentifier(tagId);
  const canCreate = isValidJavaNamespacedIdentifier(tagId) && draftValues.length > 0;

  const handleAddMember = (candidate: MemberCandidate) => {
    const value: TagValue =
      candidate.kind === "item"
        ? { type: "item", id: candidate.item.id }
        : { type: "tag", id: candidate.tagItem.id };

    setDraftValues((prev) => {
      if (prev.some((v) => v.id.raw === value.id.raw)) return prev;
      return [...prev, value];
    });
  };

  const handleRemoveMember = (index: number) => {
    setDraftValues((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreate = () => {
    if (!canCreate) return;
    const identifier = parseStringToMinecraftIdentifier(tagId);
    createTag({
      name: identifier.id,
      namespace: identifier.namespace,
      values: draftValues,
    });
    onClose();
  };

  const existingMemberIds = useMemo(() => new Set(draftValues.map((v) => v.id.raw)), [draftValues]);

  const filteredMemberCandidates = useMemo((): MemberCandidate[] => {
    const normalized = memberSearch.trim().toLowerCase();
    const candidates: MemberCandidate[] = [];

    for (const item of items) {
      if (
        !normalized ||
        item.displayName.toLowerCase().includes(normalized) ||
        item.id.raw.toLowerCase().includes(normalized)
      ) {
        candidates.push({ kind: "item", item });
      }
    }

    const allTagItems = [
      ...vanillaTagItems,
      ...tags.map((t) => customTagItems[t.uid]).filter(Boolean),
    ];

    for (const tagItem of allTagItems) {
      if (
        !normalized ||
        tagItem.id.raw.toLowerCase().includes(normalized) ||
        tagItem.displayName.toLowerCase().includes(normalized)
      ) {
        candidates.push({ kind: "tag", tagItem, rawId: tagItem.id.raw });
      }
    }

    return candidates;
  }, [memberSearch, items, vanillaTagItems, tags, customTagItems]);

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="text-muted-foreground hover:bg-accent hover:text-foreground rounded p-1 transition-colors"
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
          aria-invalid={showTagIdError}
          className={cn(
            "border-input bg-background text-foreground focus:ring-ring rounded-md border px-3 py-2 text-sm outline-hidden focus:ring-2 focus:ring-inset",
            showTagIdError && "border-destructive focus:ring-destructive",
          )}
          onChange={(event) => setTagId(event.target.value)}
        />
        {showTagIdError && (
          <span className="text-destructive text-[10px]">{javaNamespacedIdentifierHint}</span>
        )}
      </label>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-foreground text-xs font-medium">Members</span>
          <span className="text-muted-foreground text-xs">{draftValues.length}</span>
        </div>

        {draftValues.length > 0 ? (
          <div className="flex flex-wrap">
            {draftValues.map((value, index) => {
              const itemIds =
                value.type === "item"
                  ? [value.id.raw]
                  : resolveTagValues([value], tags, vanillaTags);
              const directItem = value.type === "item" ? itemsById?.[value.id.raw] : undefined;
              const label =
                value.type === "item"
                  ? (directItem?.displayName ?? value.id.raw)
                  : getTagLabel(value.id.raw);

              return (
                <ItemTooltip
                  key={`${value.id.raw}-${index}`}
                  title={label}
                  description={value.id.raw}
                >
                  <button
                    type="button"
                    className="relative"
                    onClick={() => handleRemoveMember(index)}
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
            No members yet. Search below to add items or tags.
          </p>
        )}
      </div>

      <MemberCandidateList
        candidates={filteredMemberCandidates}
        memberSearch={memberSearch}
        existingMemberIds={existingMemberIds}
        onSearchChange={setMemberSearch}
        onAdd={handleAddMember}
      />

      <button
        type="button"
        disabled={!canCreate}
        onClick={handleCreate}
        className="border-border text-foreground hover:bg-accent rounded-md border px-3 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        Create Tag
      </button>
    </div>
  );
};
