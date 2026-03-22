import { useLayoutEffect, useRef, useState } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";

import { getRawId, identifierUniqueKey } from "@/data/models/identifier/utilities";
import { Item as ItemType } from "@/data/models/types";
import { useFuzzySearch } from "@/hooks/use-fuzzy-search";
import { useCustomItemStore } from "@/stores/custom-item";

import { Item } from "../../item/item";
import { Slot } from "../../slot/slot";
import { InventoryGridContainer } from "../inventory-grid-container";
import { AddItemForm } from "./add-item-form";
import { CustomItemEditor } from "./custom-item-editor";

const SLOT_SIZE = 36;

const getGridContentWidth = (element: HTMLDivElement) => {
  const styles = getComputedStyle(element);
  const horizontalPadding =
    (Number.parseFloat(styles.paddingLeft) || 0) + (Number.parseFloat(styles.paddingRight) || 0);

  return element.clientWidth - horizontalPadding;
};

interface ItemsSectionProps {
  items: ItemType[];
  search: string;
  showAddItemForm: boolean;
  onCloseAddItemForm: () => void;
}

const VirtualizedItemGrid = ({ items }: { items: ItemType[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    setContainerWidth(getGridContentWidth(el));

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
    <InventoryGridContainer ref={scrollRef}>
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
                <Slot key={identifierUniqueKey(item.id)}>
                  <Item item={item} container="ingredients" />
                </Slot>
              ))}
            </div>
          );
        })}
      </div>
    </InventoryGridContainer>
  );
};

export const ItemsSection = ({
  items,
  search,
  showAddItemForm,
  onCloseAddItemForm,
}: ItemsSectionProps) => {
  const customItems = useCustomItemStore((state) => state.customItems);
  const [expandedItemUid, setExpandedItemUid] = useState<string | null>(null);

  const filteredCustomItems = useFuzzySearch(customItems, search, (item) => [
    item.displayName,
    getRawId(item.id),
  ]);

  if (showAddItemForm) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <AddItemForm onClose={onCloseAddItemForm} />
      </div>
    );
  }

  if (expandedItemUid) {
    const expandedItem = customItems.find((item) => item.uid === expandedItemUid);
    if (expandedItem) {
      return (
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <CustomItemEditor
            key={expandedItem.uid}
            item={expandedItem}
            isExpanded
            onToggle={() => setExpandedItemUid(null)}
          />
        </div>
      );
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      {filteredCustomItems.length > 0 && (
        <span className="text-muted-foreground hidden text-xs font-medium lg:block">
          Custom Items
        </span>
      )}

      {filteredCustomItems.length > 0 && (
        <div className="flex shrink-0 gap-2 overflow-x-auto pb-1 lg:grid lg:max-h-[33%] lg:grid-cols-2 lg:content-start lg:gap-2 lg:overflow-x-hidden lg:overflow-y-auto lg:pb-0">
          {filteredCustomItems.map((item) => (
            <CustomItemEditor
              key={item.uid}
              item={item}
              isExpanded={false}
              onToggle={() => setExpandedItemUid(item.uid)}
              className="min-w-[180px] snap-start lg:min-w-0"
            />
          ))}
        </div>
      )}

      {filteredCustomItems.length > 0 && (
        <span className="text-muted-foreground hidden text-xs font-medium lg:block">
          Vanilla Items
        </span>
      )}

      <VirtualizedItemGrid items={items} />
    </div>
  );
};
