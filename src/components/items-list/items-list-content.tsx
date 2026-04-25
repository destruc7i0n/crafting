import type { Dispatch, SetStateAction } from "react";

import { useFuzzySearch } from "@/hooks/use-fuzzy-search";
import { useResourcesForVersion } from "@/hooks/use-resources-for-version";

import { ItemsSection } from "./item/items-section";
import { TagsSection } from "./tag/tags-section";

interface ItemsListContentProps {
  tab: "items" | "tags";
  search: string;
  expandedTagUid: string | null;
  setExpandedTagUid: Dispatch<SetStateAction<string | null>>;
  showAddItemForm: boolean;
  showAddTagForm: boolean;
  onCloseAddItemForm: () => void;
  onCloseAddTagForm: () => void;
  supportsCustomTags: boolean;
}

export const ItemsListContent = ({
  tab,
  search,
  expandedTagUid,
  setExpandedTagUid,
  showAddItemForm,
  showAddTagForm,
  onCloseAddItemForm,
  onCloseAddTagForm,
  supportsCustomTags,
}: ItemsListContentProps) => {
  const { resources } = useResourcesForVersion();
  const items = useFuzzySearch(resources?.items ?? [], search, (item) => [item.displayName]);

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-2 rounded-md md:gap-0">
      {tab === "tags" ? (
        <TagsSection
          search={search}
          expandedTagUid={expandedTagUid}
          setExpandedTagUid={setExpandedTagUid}
          showAddTagForm={showAddTagForm}
          onCloseAddTagForm={onCloseAddTagForm}
          supportsCustomTags={supportsCustomTags}
        />
      ) : (
        <ItemsSection
          search={search}
          items={items}
          showAddItemForm={showAddItemForm}
          onCloseAddItemForm={onCloseAddItemForm}
        />
      )}
    </div>
  );
};
