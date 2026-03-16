import { useMemo, useRef, useState } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";

import { CyclingItemPreview } from "@/components/item/cycling-item-preview";
import { ItemPreview } from "@/components/item/item-preview";
import { ItemTooltip } from "@/components/tooltip/item-tooltip";
import { Item, Tag, TagItem } from "@/data/models/types";
import {
  isValidJavaIdentifierNamespace,
  isValidJavaIdentifierPath,
  javaIdentifierNamespaceHint,
  javaIdentifierPathHint,
} from "@/lib/minecraft-identifier";
import {
  getTagLabel,
  getTagNameOrFallback,
  getTagNamespaceOrFallback,
  resolveTagValues,
} from "@/lib/tags";
import { cn } from "@/lib/utils";
import { useTagStore } from "@/stores/tag";

import { Slot } from "../slot/slot";

type MemberCandidate =
  | { kind: "item"; item: Item }
  | { kind: "tag"; tagItem: TagItem; rawId: string };

const ROW_HEIGHT = 40;
const LIST_MAX_ROWS = 6;

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

  const [draftName, setDraftName] = useState(tag.name);
  const [draftNamespace, setDraftNamespace] = useState(tag.namespace);
  const [memberSearch, setMemberSearch] = useState("");
  const prevUidRef = useRef(tag.uid);

  if (prevUidRef.current !== tag.uid) {
    prevUidRef.current = tag.uid;
    setDraftName(tag.name);
    setDraftNamespace(tag.namespace);
    setMemberSearch("");
  }

  const showDraftNamespaceError =
    draftNamespace.trim().length > 0 && !isValidJavaIdentifierNamespace(draftNamespace);
  const showDraftNameError = draftName.trim().length > 0 && !isValidJavaIdentifierPath(draftName);

  const commitTag = () => {
    if (showDraftNamespaceError || showDraftNameError) {
      return;
    }

    const nextName = getTagNameOrFallback(draftName || tag.name);
    const nextNamespace = getTagNamespaceOrFallback(draftNamespace || tag.namespace);
    updateTag(tag.uid, { name: nextName, namespace: nextNamespace });
  };

  const handleAddMember = (candidate: MemberCandidate) => {
    if (candidate.kind === "item") {
      addValueToTag(tag.uid, { type: "item", id: candidate.item.id });
    } else {
      addValueToTag(tag.uid, { type: "tag", id: candidate.tagItem.id });
    }
  };

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
      ...tags
        .filter((t) => t.uid !== tag.uid)
        .map((t) => customTagItems[t.uid])
        .filter(Boolean),
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
  }, [memberSearch, items, vanillaTagItems, tags, customTagItems, tag.uid]);

  const existingMemberIds = useMemo(() => new Set(tag.values.map((v) => v.id.raw)), [tag.values]);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-muted-foreground flex flex-col gap-1 text-xs">
          Namespace
          <input
            value={draftNamespace}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={showDraftNamespaceError}
            className={cn(
              "border-input bg-background text-foreground focus:ring-ring rounded-md border px-3 py-2 text-sm outline-hidden focus:ring-2 focus:ring-inset",
              showDraftNamespaceError && "border-destructive focus:ring-destructive",
            )}
            onBlur={commitTag}
            onChange={(event) => setDraftNamespace(event.target.value)}
          />
          {showDraftNamespaceError && (
            <span className="text-destructive text-[10px]">{javaIdentifierNamespaceHint}</span>
          )}
        </label>

        <label className="text-muted-foreground flex flex-col gap-1 text-xs">
          Name
          <input
            value={draftName}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={showDraftNameError}
            className={cn(
              "border-input bg-background text-foreground focus:ring-ring rounded-md border px-3 py-2 text-sm outline-hidden focus:ring-2 focus:ring-inset",
              showDraftNameError && "border-destructive focus:ring-destructive",
            )}
            onBlur={commitTag}
            onChange={(event) => setDraftName(event.target.value)}
          />
          {showDraftNameError && (
            <span className="text-destructive text-[10px]">{javaIdentifierPathHint}</span>
          )}
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-foreground text-xs font-medium">Members</span>
          <span className="text-muted-foreground text-xs">{tag.values.length}</span>
        </div>

        {tag.values.length > 0 ? (
          <div className="flex flex-wrap">
            {tag.values.map((value, index) => {
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
    </div>
  );
};

const MemberCandidateList = ({
  candidates,
  memberSearch,
  existingMemberIds,
  onSearchChange,
  onAdd,
}: {
  candidates: MemberCandidate[];
  memberSearch: string;
  existingMemberIds: Set<string>;
  onSearchChange: (value: string) => void;
  onAdd: (candidate: MemberCandidate) => void;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: candidates.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  return (
    <div className="flex flex-col gap-2">
      <span className="text-foreground text-xs font-medium">Add members</span>

      <input
        type="text"
        value={memberSearch}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search items and tags..."
        className="border-input bg-background text-foreground focus:ring-ring rounded-md border px-3 py-2 text-sm outline-hidden focus:ring-2 focus:ring-inset"
      />

      <div
        ref={scrollRef}
        className="border-border bg-muted/40 overflow-y-auto rounded-md border"
        style={{ maxHeight: ROW_HEIGHT * LIST_MAX_ROWS }}
      >
        <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const candidate = candidates[virtualRow.index];

            if (candidate.kind === "tag") {
              const isAdded = existingMemberIds.has(candidate.rawId);

              return (
                <button
                  key={`tag-${candidate.rawId}`}
                  type="button"
                  disabled={isAdded}
                  className={cn(
                    "absolute left-0 flex w-full items-center gap-2 px-2 transition-colors",
                    isAdded ? "cursor-default opacity-40" : "hover:bg-accent",
                  )}
                  style={{
                    top: virtualRow.start,
                    height: virtualRow.size,
                  }}
                  onClick={() => !isAdded && onAdd(candidate)}
                >
                  <Slot width={32} height={32} className="shrink-0">
                    <CyclingItemPreview
                      alt={candidate.tagItem.displayName}
                      itemIds={candidate.tagItem.values}
                    />
                  </Slot>
                  <div className="min-w-0 flex-1 text-left">
                    <div className="truncate text-sm font-medium">{candidate.tagItem.id.id}</div>
                    <div className="text-muted-foreground truncate text-xs">
                      {getTagLabel(candidate.rawId)}
                    </div>
                  </div>
                </button>
              );
            }

            const isAdded = existingMemberIds.has(candidate.item.id.raw);

            return (
              <button
                key={candidate.item.id.raw}
                type="button"
                disabled={isAdded}
                className={cn(
                  "absolute left-0 flex w-full items-center gap-2 px-2 transition-colors",
                  isAdded ? "cursor-default opacity-40" : "hover:bg-accent",
                )}
                style={{
                  top: virtualRow.start,
                  height: virtualRow.size,
                }}
                onClick={() => !isAdded && onAdd(candidate)}
              >
                <Slot width={32} height={32} className="shrink-0">
                  <ItemPreview alt={candidate.item.displayName} texture={candidate.item.texture} />
                </Slot>
                <div className="min-w-0 flex-1 text-left">
                  <div className="truncate text-sm font-medium">{candidate.item.displayName}</div>
                  <div className="text-muted-foreground truncate text-xs">
                    {candidate.item.id.raw}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
