import { useEffect, useMemo, useState } from "react";

import { PlusIcon } from "lucide-react";

import { useResourcesForVersion } from "@/hooks/use-resources-for-version";
import { supportsItemTagsForVersion } from "@/lib/tags";
import { useUIStore } from "@/stores/ui";

import { ItemsSection } from "./items-section";
import { TagsSection } from "./tags-section";

export const ItemsList = () => {
  const { resources, version } = useResourcesForVersion();

  const resourceItems = resources?.items;
  const supportsTags = supportsItemTagsForVersion(version);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"items" | "tags">("items");

  const showAddItemForm = useUIStore((state) => state.showAddItemForm);
  const toggleAddItemForm = useUIStore((state) => state.toggleAddItemForm);
  const toggleAddTagForm = useUIStore((state) => state.toggleAddTagForm);

  const isCreating = activeTab === "items" && showAddItemForm;

  useEffect(() => {
    if (!supportsTags && activeTab === "tags") {
      setActiveTab("items");
    }
  }, [activeTab, supportsTags]);

  const items = useMemo(() => {
    if (!resourceItems) return [];
    if (!search) return resourceItems;
    return resourceItems.filter((item) =>
      item.displayName.toLowerCase().includes(search.toLowerCase()),
    );
  }, [resourceItems, search]);

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col gap-2 rounded-lg border p-2 lg:gap-3 lg:p-3">
      {/* Mobile: compact single row */}
      <div className="flex items-center gap-2 lg:hidden">
        <input
          type="text"
          className="min-w-0 flex-1 appearance-none rounded-md border border-input bg-background px-2 py-1.5 text-sm leading-tight text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-ring"
          placeholder="Search..."
          onChange={(e) => setSearch(e.target.value)}
        />

        {supportsTags && (
          <button
            type="button"
            className="shrink-0 rounded-md border border-border px-2 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            onClick={() => setActiveTab(activeTab === "items" ? "tags" : "items")}
          >
            {activeTab === "items" ? "Items" : "Tags"}
          </button>
        )}

        {!isCreating && (
          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border transition-colors hover:bg-accent"
            onClick={() => {
              if (activeTab === "items") {
                toggleAddItemForm();
              } else {
                toggleAddTagForm();
              }
            }}
            title={activeTab === "items" ? "Add custom item" : "New tag"}
          >
            <PlusIcon size={14} />
          </button>
        )}
      </div>

      {/* Desktop: tabs + add button */}
      <div className="hidden items-center gap-2 lg:flex">
        {supportsTags ? (
          <>
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === "items"
                  ? "bg-primary/10 text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
              onClick={() => setActiveTab("items")}
            >
              Items
            </button>
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === "tags"
                  ? "bg-primary/10 text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
              onClick={() => setActiveTab("tags")}
            >
              Tags
            </button>
          </>
        ) : (
          <span className="text-sm font-medium text-foreground">Items</span>
        )}

        {!isCreating && (
          <button
            type="button"
            className="ml-auto flex shrink-0 items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            onClick={() => {
              if (activeTab === "items") {
                toggleAddItemForm();
              } else {
                toggleAddTagForm();
              }
            }}
          >
            <PlusIcon size={14} />
            {activeTab === "items" ? "Add Item" : "New Tag"}
          </button>
        )}
      </div>

      <input
        type="text"
        className="hidden w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm leading-tight text-foreground outline-none transition-colors placeholder:font-minecraft placeholder:text-muted-foreground hover:bg-accent focus:ring-2 focus:ring-inset focus:ring-ring lg:block"
        placeholder={activeTab === "tags" ? "Search Tags..." : "Search Items..."}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="flex w-full min-h-0 flex-1 flex-col rounded-md">
        {activeTab === "tags" && supportsTags ? (
          <TagsSection search={search} />
        ) : (
          <ItemsSection search={search} items={items} />
        )}
      </div>
    </div>
  );
};
