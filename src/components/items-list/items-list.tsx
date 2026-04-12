import { useDeferredValue, useState } from "react";

import { PlusIcon } from "lucide-react";

import { useFuzzySearch } from "@/hooks/use-fuzzy-search";
import { useResourcesForVersion } from "@/hooks/use-resources-for-version";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui";
import { supportsCustomTags, supportsItemTags } from "@/versioning";

import { ItemsSection } from "./item/items-section";
import { TagsSection } from "./tag/tags-section";

export const ItemsList = () => {
  const { resources, version } = useResourcesForVersion();

  const resourceItems = resources?.items;
  const supportsTags = supportsItemTags(version);
  const canCreateTags = supportsCustomTags(version);

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [activeTab, setActiveTab] = useState<"items" | "tags">("items");
  const [expandedTagUid, setExpandedTagUid] = useState<string | null>(null);

  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [showAddTagForm, setShowAddTagForm] = useState(false);
  const setSelection = useUIStore((state) => state.setSelection);

  const tab: "items" | "tags" = !supportsTags && activeTab === "tags" ? "items" : activeTab;
  const showCreateButton = tab === "items" || canCreateTags;
  const isCreating = (tab === "items" && showAddItemForm) || (tab === "tags" && showAddTagForm);

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
    setSelection(undefined);
    setActiveTab(nextTab);
    setShowAddItemForm(false);
    setShowAddTagForm(false);
    setExpandedTagUid(null);
  };

  const items = useFuzzySearch(resourceItems ?? [], deferredSearch, (item) => [item.displayName]);

  const tabSwitcher = supportsTags ? (
    <div className="bg-muted relative flex shrink-0 items-center self-stretch rounded-md p-0.5 md:self-auto">
      <div
        className={cn(
          "bg-primary/40 absolute inset-y-0.5 rounded-sm transition-all duration-200 ease-in-out",
          tab === "tags" ? "right-0.5 left-1/2" : "right-1/2 left-0.5",
        )}
      />
      <button
        type="button"
        className={cn(
          "relative z-10 flex h-full w-1/2 cursor-pointer items-center justify-center rounded-sm px-2.5 text-xs font-medium transition-colors md:h-auto md:py-1 md:text-sm",
          tab === "items" ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
        onClick={() => handleTabChange("items")}
      >
        Items
      </button>
      <button
        type="button"
        className={cn(
          "relative z-10 flex h-full w-1/2 cursor-pointer items-center justify-center rounded-sm px-2.5 text-xs font-medium transition-colors md:h-auto md:py-1 md:text-sm",
          tab === "tags" ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
        onClick={() => handleTabChange("tags")}
      >
        Tags
      </button>
    </div>
  ) : null;

  return (
    <div className="md:bg-background flex h-full min-h-0 flex-1 flex-col gap-2 self-stretch bg-transparent p-0 md:mx-0 md:w-full md:gap-3 md:rounded-lg md:border md:p-3">
      <div className="flex items-center gap-2 md:hidden">
        {!isCreating && (
          <input
            type="search"
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring h-8 min-w-0 flex-1 rounded-md border px-2 text-sm outline-hidden transition-colors focus:ring-2 focus:ring-inset"
            placeholder="Search..."
            value={search}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            onChange={(event) => setSearch(event.target.value)}
          />
        )}

        {!isCreating && tabSwitcher}

        {!isCreating && showCreateButton && (
          <button
            type="button"
            className="border-border hover:bg-accent flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-colors"
            onClick={handleCreateAction}
            title={tab === "items" ? "Add custom item" : "New tag"}
          >
            <PlusIcon size={14} />
          </button>
        )}
      </div>

      <div className="hidden items-center gap-2 md:flex">
        {tabSwitcher ?? <span className="text-foreground text-sm font-medium">Items</span>}

        {!isCreating && showCreateButton && (
          <button
            type="button"
            className="border-border text-foreground hover:bg-accent ml-auto flex shrink-0 cursor-pointer items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors"
            onClick={handleCreateAction}
          >
            <PlusIcon size={14} />
            {tab === "items" ? "Add Item" : "New Tag"}
          </button>
        )}
      </div>

      {!isCreating && (
        <input
          type="search"
          className="border-input bg-background text-foreground placeholder:font-minecraft placeholder:text-muted-foreground hover:bg-accent focus:ring-ring hidden w-full rounded-md border px-3 py-2 text-sm leading-tight outline-hidden transition-colors focus:ring-2 focus:ring-inset md:block"
          placeholder={tab === "tags" ? "Search Tags..." : "Search Items..."}
          value={search}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          onChange={(event) => setSearch(event.target.value)}
        />
      )}

      <div className="flex min-h-0 w-full flex-1 flex-col gap-2 rounded-md md:gap-0">
        {tab === "tags" ? (
          <TagsSection
            search={deferredSearch}
            expandedTagUid={expandedTagUid}
            setExpandedTagUid={setExpandedTagUid}
            showAddTagForm={showAddTagForm}
            onCloseAddTagForm={() => setShowAddTagForm(false)}
            supportsCustomTags={canCreateTags}
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
