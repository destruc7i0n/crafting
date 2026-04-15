import { useRef } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";

import { CyclingItemPreview } from "@/components/item/cycling-item-preview";
import { ItemPreview } from "@/components/item/item-preview";
import { getFullId, identifierUniqueKey } from "@/data/models/identifier/utilities";
import { Item, TagItem } from "@/data/models/types";
import { getTagLabel } from "@/lib/tags";
import { cn } from "@/lib/utils";

import { Slot } from "../../slot/slot";

export type ValueOption =
  | { kind: "item"; item: Item }
  | { kind: "tag"; tagItem: TagItem; rawId: string };

const ROW_HEIGHT = 40;
const LIST_MAX_ROWS = 6;

export const ValueList = ({
  values,
  valueSearch,
  existingValueIds,
  onSearchChange,
  onAdd,
}: {
  values: ValueOption[];
  valueSearch: string;
  existingValueIds: Set<string>;
  onSearchChange: (value: string) => void;
  onAdd: (value: ValueOption) => void;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: values.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  return (
    <div className="flex flex-col gap-2">
      <span className="text-foreground text-xs font-medium">Add values</span>

      <input
        type="search"
        value={valueSearch}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
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
            const entry = values[virtualRow.index];

            if (entry.kind === "tag") {
              const isAdded = existingValueIds.has(entry.rawId);

              return (
                <button
                  key={`tag-${entry.rawId}`}
                  type="button"
                  disabled={isAdded}
                  className={cn(
                    "absolute left-0 flex w-full items-center gap-2 px-2 transition-colors",
                    isAdded ? "cursor-default opacity-40" : "hover:bg-accent",
                  )}
                  style={{ top: virtualRow.start, height: virtualRow.size }}
                  onClick={() => !isAdded && onAdd(entry)}
                >
                  <Slot width={32} height={32} className="shrink-0">
                    <CyclingItemPreview
                      alt={entry.tagItem.displayName}
                      itemIds={entry.tagItem.values}
                    />
                  </Slot>
                  <div className="min-w-0 flex-1 text-left">
                    <div className="truncate text-sm font-medium">{entry.tagItem.id.id}</div>
                    <div className="text-muted-foreground truncate text-xs">
                      {getTagLabel(entry.rawId)}
                    </div>
                  </div>
                </button>
              );
            }

            const isAdded = existingValueIds.has(identifierUniqueKey(entry.item.id));

            return (
              <button
                key={identifierUniqueKey(entry.item.id)}
                type="button"
                disabled={isAdded}
                className={cn(
                  "absolute left-0 flex w-full items-center gap-2 px-2 transition-colors",
                  isAdded ? "cursor-default opacity-40" : "hover:bg-accent",
                )}
                style={{ top: virtualRow.start, height: virtualRow.size }}
                onClick={() => !isAdded && onAdd(entry)}
              >
                <Slot width={32} height={32} className="shrink-0">
                  <ItemPreview alt={entry.item.displayName} texture={entry.item.texture} />
                </Slot>
                <div className="min-w-0 flex-1 text-left">
                  <div className="truncate text-sm font-medium">{entry.item.displayName}</div>
                  <div className="text-muted-foreground truncate text-xs">
                    {getFullId(entry.item.id)}
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
