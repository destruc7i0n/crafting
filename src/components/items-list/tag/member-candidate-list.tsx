import { useRef } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";

import { CyclingItemPreview } from "@/components/item/cycling-item-preview";
import { ItemPreview } from "@/components/item/item-preview";
import { getRawId, identifierUniqueKey } from "@/data/models/identifier/utilities";
import { Item, TagItem } from "@/data/models/types";
import { getTagLabel } from "@/lib/tags";
import { cn } from "@/lib/utils";

import { Slot } from "../../slot/slot";

export type MemberCandidate =
  | { kind: "item"; item: Item }
  | { kind: "tag"; tagItem: TagItem; rawId: string };

const ROW_HEIGHT = 40;
const LIST_MAX_ROWS = 6;

export const MemberCandidateList = ({
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
                  style={{ top: virtualRow.start, height: virtualRow.size }}
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

            const isAdded = existingMemberIds.has(identifierUniqueKey(candidate.item.id));

            return (
              <button
                key={identifierUniqueKey(candidate.item.id)}
                type="button"
                disabled={isAdded}
                className={cn(
                  "absolute left-0 flex w-full items-center gap-2 px-2 transition-colors",
                  isAdded ? "cursor-default opacity-40" : "hover:bg-accent",
                )}
                style={{ top: virtualRow.start, height: virtualRow.size }}
                onClick={() => !isAdded && onAdd(candidate)}
              >
                <Slot width={32} height={32} className="shrink-0">
                  <ItemPreview alt={candidate.item.displayName} texture={candidate.item.texture} />
                </Slot>
                <div className="min-w-0 flex-1 text-left">
                  <div className="truncate text-sm font-medium">{candidate.item.displayName}</div>
                  <div className="text-muted-foreground truncate text-xs">
                    {getRawId(candidate.item.id)}
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
