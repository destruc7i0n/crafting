import { useEffect, useMemo, useRef, useState } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";

import { Item as ItemType } from "@/data/models/types";
import { useCustomItemStore } from "@/stores/custom-item";
import { useUIStore } from "@/stores/ui";

import { Item } from "../item/item";
import { Slot } from "../slot/slot";
import { AddItemForm } from "./add-item-form";
import { CustomItemCard } from "./custom-item-card";

const SLOT_SIZE = 36;

interface ItemsSectionProps {
  items: ItemType[];
  search: string;
}

const VirtualizedItemGrid = ({ items }: { items: ItemType[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const itemsPerRow = Math.max(1, Math.floor(containerWidth / SLOT_SIZE));
  const rowCount = Math.ceil(items.length / itemsPerRow);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => SLOT_SIZE,
    overscan: 10,
  });

  return (
    <div
      ref={scrollRef}
      className="min-h-0 flex-1 overflow-y-auto rounded-md bg-minecraft-inventory-bg"
    >
      <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * itemsPerRow;
          const rowItems = items.slice(startIndex, startIndex + itemsPerRow);

          return (
            <div
              key={virtualRow.index}
              className="absolute left-0 flex w-full"
              style={{ top: virtualRow.start, height: virtualRow.size }}
            >
              {rowItems.map((item) => (
                <Slot key={item.id.raw}>
                  <Item item={item} container="ingredients" />
                </Slot>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ItemsSection = ({ items, search }: ItemsSectionProps) => {
  const customItems = useCustomItemStore((state) => state.customItems);
  const showForm = useUIStore((state) => state.showAddItemForm);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (!search) return items;
    return items.filter((item) => item.displayName.toLowerCase().includes(search.toLowerCase()));
  }, [items, search]);

  const filteredCustomItems = useMemo(() => {
    if (!search) return customItems;
    const lower = search.toLowerCase();
    return customItems.filter(
      (item) =>
        item.displayName.toLowerCase().includes(lower) || item.id.raw.toLowerCase().includes(lower),
    );
  }, [customItems, search]);

  if (showForm) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-2 p-1 lg:p-0">
        <AddItemForm />
      </div>
    );
  }

  if (expandedItemId) {
    const expandedItem = customItems.find((item) => item.id.raw === expandedItemId);
    if (expandedItem) {
      return (
        <div className="flex min-h-0 flex-1 flex-col gap-2 p-1 lg:p-0">
          <CustomItemCard
            key={expandedItem.id.raw}
            item={expandedItem}
            isExpanded
            onToggle={() => setExpandedItemId(null)}
          />
        </div>
      );
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 p-1 lg:p-0">
      {filteredCustomItems.length > 0 && (
        <span className="hidden text-xs font-medium text-muted-foreground lg:block">
          Custom Items
        </span>
      )}

      {filteredCustomItems.length > 0 && (
        <div className="grid max-h-[33%] shrink-0 grid-cols-2 content-start gap-2 overflow-y-auto">
          {filteredCustomItems.map((item) => (
            <CustomItemCard
              key={item.id.raw}
              item={item}
              isExpanded={false}
              onToggle={() => setExpandedItemId(item.id.raw)}
            />
          ))}
        </div>
      )}

      <VirtualizedItemGrid items={filteredItems} />
    </div>
  );
};
