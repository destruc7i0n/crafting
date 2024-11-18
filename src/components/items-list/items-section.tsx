import { useMemo } from "react";

import { Item as ItemType } from "@/data/models/types";

import { Item } from "../item/item";
import { Slot } from "../slot/slot";

interface ItemsSectionProps {
  items: ItemType[];
  search: string;
}

export const ItemsSection = ({ items, search }: ItemsSectionProps) => {
  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (!search) return items;
    return items.filter((item) =>
      item.displayName.toLowerCase().includes(search.toLowerCase()),
    );
  }, [items, search]);

  return (
    <div className="flex flex-col">
      <span className="sticky top-0 z-10 bg-minecraft-inventory-bg/95 p-2 font-minecraft">
        Items
      </span>
      <div className="flex w-full flex-wrap p-2 pt-0">
        {filteredItems.map((item) => (
          <Slot key={item.id.raw}>
            <Item key={item.id.raw} item={item} container="ingredients" />
          </Slot>
        ))}
      </div>
    </div>
  );
};
