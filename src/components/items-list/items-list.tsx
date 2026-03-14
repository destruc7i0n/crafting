import { useMemo, useState } from "react";

import { useResourcesForVersion } from "@/hooks/use-resources-for-version";

import { ItemsSection } from "./items-section";
import { TagsSection } from "./tags-section";

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
    <div className="flex h-full w-full flex-1 min-h-0 flex-col gap-2 rounded-lg border p-2">
      <input
        type="text"
        className="w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm leading-tight text-foreground outline-none transition-colors placeholder:font-minecraft placeholder:text-muted-foreground hover:bg-accent focus:ring-2 focus:ring-ring"
        placeholder="Search Items and Tags..."
        onChange={(e) => setSearch(e.target.value)}
      />

      <p className="text-xs text-muted-foreground lg:hidden">
        Mobile tip: tap an item, then tap a recipe slot to place it.
      </p>

      <div className="flex w-full flex-1 flex-col overflow-y-auto rounded-md bg-minecraft-inventory-bg">
        <TagsSection search={search} />
        <ItemsSection search={search} items={items} />
      </div>
    </div>
  );
};
