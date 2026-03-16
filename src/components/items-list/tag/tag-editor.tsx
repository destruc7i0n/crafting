import { useMemo, useRef, useState } from "react";

import { CyclingItemPreview } from "@/components/item/cycling-item-preview";
import { ItemPreview } from "@/components/item/item-preview";
import { ItemTooltip } from "@/components/tooltip/item-tooltip";
import { getFullId, getRawId, identifierUniqueKey } from "@/data/models/identifier/utilities";
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

import { Slot } from "../../slot/slot";
import { MemberCandidate, MemberCandidateList } from "./member-candidate-list";

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
        getRawId(item.id).toLowerCase().includes(normalized)
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
        getRawId(tagItem.id).toLowerCase().includes(normalized) ||
        tagItem.displayName.toLowerCase().includes(normalized)
      ) {
        candidates.push({ kind: "tag", tagItem, rawId: getRawId(tagItem.id) });
      }
    }

    return candidates;
  }, [memberSearch, items, vanillaTagItems, tags, customTagItems, tag.uid]);

  const existingMemberIds = useMemo(
    () => new Set(tag.values.map((v) => identifierUniqueKey(v.id))),
    [tag.values],
  );

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
