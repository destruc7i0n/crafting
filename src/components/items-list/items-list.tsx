import { useDeferredValue, useMemo, useState } from "react";

import { PlusIcon } from "lucide-react";

import { useIsTouchDevice } from "@/hooks/use-is-touch-device";
import { useResourcesForVersion } from "@/hooks/use-resources-for-version";
import { supportsItemTagsForVersion } from "@/lib/tags";
import { useTagStore } from "@/stores/tag";
import { useUIStore } from "@/stores/ui";

import { ItemsSection } from "./items-section";
import { TagsSection } from "./tags-section";

export const ItemsList = () => {
  const { resources, version } = useResourcesForVersion();

  const resourceItems = resources?.items;
  const supportsTags = supportsItemTagsForVersion(version);

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [activeTab, setActiveTab] = useState<"items" | "tags">("items");
  const [expandedTagUid, setExpandedTagUid] = useState<string | null>(null);

  const isTouchDevice = useIsTouchDevice();
  const showAddItemForm = useUIStore((state) => state.showAddItemForm);
  const selectedIngredient = useUIStore((state) => state.selectedIngredient);
  const setSelectedIngredient = useUIStore((state) => state.setSelectedIngredient);
  const toggleAddItemForm = useUIStore((state) => state.toggleAddItemForm);
  const createTag = useTagStore((state) => state.createTag);

  const tab: "items" | "tags" = !supportsTags && activeTab === "tags" ? "items" : activeTab;
  const isCreating = tab === "items" && showAddItemForm;
  const showSelectionPreview =
    isTouchDevice &&
    !!selectedIngredient &&
    !showAddItemForm &&
    !(tab === "tags" && expandedTagUid !== null);

  const handleCreateAction = () => {
    if (tab === "items") {
      toggleAddItemForm();
      return;
    }

    const uid = createTag();
    setExpandedTagUid(uid);
  };

  const handleTabChange = (nextTab: "items" | "tags") => {
    setSelectedIngredient(undefined);
    setActiveTab(nextTab);
  };

  const items = useMemo(() => {
    if (!resourceItems) return [];
    if (!deferredSearch) return resourceItems;
    return resourceItems.filter((item) =>
      item.displayName.toLowerCase().includes(deferredSearch.toLowerCase()),
    );
  }, [resourceItems, deferredSearch]);

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col gap-2 rounded-lg border p-2 lg:gap-3 lg:p-3">
      {/* Mobile: compact single row */}
      <div className="flex items-center gap-2 lg:hidden">
        <input
          type="text"
          className="min-w-0 flex-1 appearance-none rounded-md border border-input bg-background px-2 py-1.5 text-sm leading-tight text-foreground outline-hidden transition-colors placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-ring"
          placeholder="Search..."
          onChange={(event) => setSearch(event.target.value)}
        />

        {supportsTags && (
          <button
            type="button"
            className="shrink-0 rounded-md border border-border px-2 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            onClick={() => handleTabChange(activeTab === "items" ? "tags" : "items")}
            title={tab === "items" ? "Switch to tags" : "Switch to items"}
          >
            {tab === "items" ? "Tags" : "Items"}
          </button>
        )}

        {!isCreating && (
          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border transition-colors hover:bg-accent"
            onClick={handleCreateAction}
            title={tab === "items" ? "Add custom item" : "New tag"}
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
                tab === "items"
                  ? "bg-primary/10 text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
              onClick={() => handleTabChange("items")}
            >
              Items
            </button>
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === "tags"
                  ? "bg-primary/10 text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
              onClick={() => handleTabChange("tags")}
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
            onClick={handleCreateAction}
          >
            <PlusIcon size={14} />
            {tab === "items" ? "Add Item" : "New Tag"}
          </button>
        )}
      </div>

      <input
        type="text"
        className="hidden w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm leading-tight text-foreground outline-hidden transition-colors placeholder:font-minecraft placeholder:text-muted-foreground hover:bg-accent focus:ring-2 focus:ring-inset focus:ring-ring lg:block"
        placeholder={tab === "tags" ? "Search Tags..." : "Search Items..."}
        onChange={(event) => setSearch(event.target.value)}
      />

      {showSelectionPreview && (
        <div className="rounded-md border border-border bg-muted/40 px-2 py-1 text-xs leading-tight">
          <div className="truncate text-foreground">
            <span className="font-medium">{selectedIngredient.displayName}</span>
            <span className="text-muted-foreground">{` · ${selectedIngredient.id.raw}`}</span>
          </div>
        </div>
      )}

      <div className="flex w-full min-h-0 flex-1 flex-col rounded-md">
        {tab === "tags" ? (
          <TagsSection
            search={deferredSearch}
            expandedTagUid={expandedTagUid}
            setExpandedTagUid={setExpandedTagUid}
          />
        ) : (
          <ItemsSection search={deferredSearch} items={items} />
        )}
      </div>
    </div>
  );
};
