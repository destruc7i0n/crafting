import { useDeferredValue, useMemo, useState } from "react";

import { PlusIcon } from "lucide-react";

import { getRawId } from "@/data/models/identifier/utilities";
import { useIsTouchDevice } from "@/hooks/use-is-touch-device";
import { useResourcesForVersion } from "@/hooks/use-resources-for-version";
import { supportsItemTagsForVersion } from "@/lib/tags";
import { useUIStore } from "@/stores/ui";

import { ItemsSection } from "./item/items-section";
import { TagsSection } from "./tag/tags-section";

export const ItemsList = () => {
  const { resources, version } = useResourcesForVersion();

  const resourceItems = resources?.items;
  const supportsTags = supportsItemTagsForVersion(version);

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [activeTab, setActiveTab] = useState<"items" | "tags">("items");
  const [expandedTagUid, setExpandedTagUid] = useState<string | null>(null);

  const isTouchDevice = useIsTouchDevice();
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [showAddTagForm, setShowAddTagForm] = useState(false);
  const selectedIngredient = useUIStore((state) => state.selectedIngredient);
  const setSelectedIngredient = useUIStore((state) => state.setSelectedIngredient);

  const tab: "items" | "tags" = !supportsTags && activeTab === "tags" ? "items" : activeTab;
  const isCreating = (tab === "items" && showAddItemForm) || (tab === "tags" && showAddTagForm);
  const showSelectionPreview =
    isTouchDevice &&
    !!selectedIngredient &&
    !isCreating &&
    !(tab === "tags" && expandedTagUid !== null);

  const handleCreateAction = () => {
    switch (tab) {
      case "items":
        setShowAddItemForm(true);
        break;
      case "tags":
        setShowAddTagForm(true);
        setExpandedTagUid(null);
        break;
    }
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

  const tabSwitcher = supportsTags ? (
    <div className="bg-muted flex shrink-0 items-center self-stretch rounded-md p-0.5 lg:self-auto">
      <button
        type="button"
        className={`flex h-full cursor-pointer items-center justify-center rounded-sm px-2.5 text-xs font-medium transition-colors lg:h-auto lg:py-1 lg:text-sm ${
          tab === "items"
            ? "bg-primary/40 text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={() => handleTabChange("items")}
      >
        Items
      </button>
      <button
        type="button"
        className={`flex h-full cursor-pointer items-center justify-center rounded-sm px-2.5 text-xs font-medium transition-colors lg:h-auto lg:py-1 lg:text-sm ${
          tab === "tags"
            ? "bg-primary/40 text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={() => handleTabChange("tags")}
      >
        Tags
      </button>
    </div>
  ) : null;

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col gap-2 rounded-lg border p-2 lg:gap-3 lg:p-3">
      {/* Mobile: compact single row */}
      <div className="flex items-center gap-2 lg:hidden">
        {!isCreating && (
          <input
            type="text"
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring h-8 min-w-0 flex-1 appearance-none rounded-md border px-2 text-sm outline-hidden transition-colors focus:ring-2 focus:ring-inset"
            placeholder="Search..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        )}

        {!isCreating && tabSwitcher}

        {!isCreating && (
          <button
            type="button"
            className="border-border hover:bg-accent flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors"
            onClick={handleCreateAction}
            title={tab === "items" ? "Add custom item" : "New tag"}
          >
            <PlusIcon size={14} />
          </button>
        )}
      </div>

      {/* Desktop: tabs + add button */}
      <div className="hidden items-center gap-2 lg:flex">
        {tabSwitcher ?? <span className="text-foreground text-sm font-medium">Items</span>}

        {!isCreating && (
          <button
            type="button"
            className="border-border text-foreground hover:bg-accent ml-auto flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors"
            onClick={handleCreateAction}
          >
            <PlusIcon size={14} />
            {tab === "items" ? "Add Item" : "New Tag"}
          </button>
        )}
      </div>

      {!isCreating && (
        <input
          type="text"
          className="border-input bg-background text-foreground placeholder:font-minecraft placeholder:text-muted-foreground hover:bg-accent focus:ring-ring hidden w-full appearance-none rounded-md border px-3 py-2 text-sm leading-tight outline-hidden transition-colors focus:ring-2 focus:ring-inset lg:block"
          placeholder={tab === "tags" ? "Search Tags..." : "Search Items..."}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      )}

      {showSelectionPreview && (
        <div className="border-border bg-muted/40 rounded-md border px-2 py-1 text-xs leading-tight">
          <div className="text-foreground truncate">
            <span className="font-medium">{selectedIngredient.displayName}</span>
            <span className="text-muted-foreground">{` · ${getRawId(selectedIngredient.id)}`}</span>
          </div>
        </div>
      )}

      <div className="flex min-h-0 w-full flex-1 flex-col rounded-md">
        {tab === "tags" ? (
          <TagsSection
            search={deferredSearch}
            expandedTagUid={expandedTagUid}
            setExpandedTagUid={setExpandedTagUid}
            showAddTagForm={showAddTagForm}
            onCloseAddTagForm={() => setShowAddTagForm(false)}
          />
        ) : (
          <ItemsSection
            search={deferredSearch}
            items={items}
            showAddItemForm={showAddItemForm}
            onCloseAddItemForm={() => setShowAddItemForm(false)}
          />
        )}
      </div>
    </div>
  );
};
