import { useMemo, useState } from "react";

import { useResourcesForVersion } from "@/hooks/use-resources-for-version";

import { Item } from "../item/item";
import { Slot } from "../slot/slot";

export const ItemsList = () => {
  const { resources } = useResourcesForVersion();

  const resourceItems = resources?.items;

  const [search, setSearch] = useState("");

  const items = useMemo(() => {
    if (!resourceItems) return [];
    if (!search) return resourceItems;
    return resourceItems.filter((item) =>
      item.displayName.toLowerCase().includes(search.toLowerCase()),
    );
  }, [resourceItems, search]);

  return (
    <div className="flex max-h-[768px] w-full flex-1 flex-col gap-2 rounded-md border-2 p-2">
      <input
        type="text"
        className="focus:shadow-outline w-full appearance-none rounded-md border px-3 py-2 text-sm leading-tight text-gray-700 placeholder:font-minecraft focus:outline-none"
        placeholder="Search Items and Tags..."
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="flex w-full flex-1 flex-col overflow-y-auto rounded-md bg-minecraft-inventory-bg">
        <div className="flex flex-col">
          <span className="sticky top-0 z-10 bg-minecraft-inventory-bg/95 p-2 font-minecraft">
            Tags
          </span>
        </div>
        <div className="flex flex-col">
          <span className="sticky top-0 z-10 bg-minecraft-inventory-bg/95 p-2 font-minecraft">
            Items
          </span>
          <div className="flex w-full flex-wrap p-2 pt-0">
            {items.map((item) => (
              <Slot key={item.id.raw}>
                <Item key={item.id.raw} item={item} container="ingredients" />
              </Slot>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
