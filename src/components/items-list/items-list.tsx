import { useState } from "react";

import { useResourcesForVersion } from "@/hooks/use-resources-for-version";

import { Item } from "../item/item";
import { Slot } from "../slot/slot";

export const ItemsList = () => {
  const { resources } = useResourcesForVersion();

  const [search, setSearch] = useState("");

  if (!resources) return <div>items</div>;

  const items = search
    ? resources.items.filter((item) =>
        item.displayName.toLowerCase().includes(search.toLowerCase()),
      )
    : resources.items;

  return (
    <div className="flex max-h-[700px] w-full flex-1 flex-col gap-2 rounded-md border p-2 shadow lg:max-h-none">
      <input
        type="text"
        className="focus:shadow-outline w-full appearance-none rounded-md border px-3 py-2 text-sm leading-tight text-gray-700 focus:outline-none"
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="bg-minecraft-inventory-bg flex w-full flex-1 flex-wrap overflow-y-auto rounded-md p-2">
        {items.map((item) => (
          <Slot key={item.id.raw}>
            <Item key={item.id.raw} item={item} container="ingredients" />
          </Slot>
        ))}
      </div>
    </div>
  );
};
