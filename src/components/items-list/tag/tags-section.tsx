import { useMemo } from "react";

import { ArrowLeftIcon, DownloadIcon, Trash2Icon } from "lucide-react";

import { downloadBlob } from "@/data/datapack";
import { generateTag } from "@/data/generate/tag";
import {
  getRawId,
  identifierUniqueKey,
  parseStringToMinecraftIdentifier,
} from "@/data/models/identifier/utilities";
import { Item } from "@/data/models/types";
import { useResourcesForVersion } from "@/hooks/use-resources-for-version";
import { createTagItem, getCustomTagIdentifier, getTagLabel, resolveTagValues } from "@/lib/tags";
import { useTagStore } from "@/stores/tag";

import { Item as IngredientItem } from "../../item/item";
import { Slot } from "../../slot/slot";
import { IngredientCard } from "../ingredient-card";
import { InventoryGridContainer } from "../inventory-grid-container";
import { AddTagForm } from "./add-tag-form";
import { TagEditor } from "./tag-editor";

interface TagsSectionProps {
  search: string;
  expandedTagUid: string | null;
  setExpandedTagUid: (uid: string | null) => void;
  showAddTagForm: boolean;
  onCloseAddTagForm: () => void;
}

const EMPTY_TAGS: Record<string, string[]> = {};
const EMPTY_ITEMS: Item[] = [];

const getTagFileName = (tagId: string) => parseStringToMinecraftIdentifier(tagId).id;

export const TagsSection = ({
  search,
  expandedTagUid,
  setExpandedTagUid,
  showAddTagForm,
  onCloseAddTagForm,
}: TagsSectionProps) => {
  const { resources, version } = useResourcesForVersion();
  const tags = useTagStore((state) => state.tags);
  const removeTag = useTagStore((state) => state.removeTag);

  const vanillaTags = resources?.vanillaTags ?? EMPTY_TAGS;
  const items = resources?.items ?? EMPTY_ITEMS;
  const itemsById = resources?.itemsById;
  const normalizedSearch = search.trim().toLowerCase();
  const tagsByUid = useMemo(() => Object.fromEntries(tags.map((tag) => [tag.uid, tag])), [tags]);

  const customTagItems = useMemo(
    () =>
      Object.fromEntries(
        tags.map((tag) => {
          const identifier = getCustomTagIdentifier(tag);
          const resolvedValues = resolveTagValues(tag.values, tags, vanillaTags);

          return [
            tag.uid,
            createTagItem({
              rawId: getRawId(identifier),
              displayName: getTagLabel(getRawId(identifier)),
              values: resolvedValues,
              version,
              itemsById,
              tagSource: "custom",
              uid: tag.uid,
            }),
          ];
        }),
      ),
    [itemsById, tags, vanillaTags, version],
  );

  const vanillaTagItems = useMemo(
    () =>
      Object.entries(vanillaTags).map(([rawId, values]) =>
        createTagItem({
          rawId,
          values,
          version,
          itemsById,
          tagSource: "vanilla",
        }),
      ),
    [itemsById, vanillaTags, version],
  );

  const filteredCustomTags = useMemo(
    () =>
      tags.filter((tag) => {
        if (!normalizedSearch) return true;
        return tag.id.toLowerCase().includes(normalizedSearch);
      }),
    [normalizedSearch, tags],
  );

  const filteredVanillaTagItems = useMemo(
    () =>
      vanillaTagItems.filter((tagItem) => {
        if (!normalizedSearch) return true;
        return getRawId(tagItem.id).toLowerCase().includes(normalizedSearch);
      }),
    [normalizedSearch, vanillaTagItems],
  );

  const handleDeleteTag = (tagUid: string) => {
    removeTag(tagUid);
    if (expandedTagUid === tagUid) {
      setExpandedTagUid(null);
    }
  };

  const handleDownloadTag = (tagUid: string) => {
    const tag = tagsByUid[tagUid];
    if (!tag) return;

    const json = generateTag(tag);
    const blob = new Blob([JSON.stringify(json, null, 2)], {
      type: "application/json",
    });
    downloadBlob(blob, `${getTagFileName(tag.id)}.json`);
  };

  if (showAddTagForm && !expandedTagUid) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <AddTagForm
          onClose={onCloseAddTagForm}
          items={items}
          itemsById={itemsById}
          vanillaTagItems={vanillaTagItems}
          customTagItems={customTagItems}
          vanillaTags={vanillaTags}
        />
      </div>
    );
  }

  const expandedTag = tags.find((tag) => tag.uid === expandedTagUid);

  if (expandedTag) {
    const tagItem = customTagItems[expandedTag.uid];

    return (
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-1 lg:p-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-muted-foreground hover:bg-accent hover:text-foreground rounded p-1 transition-colors"
            onClick={() => setExpandedTagUid(null)}
          >
            <ArrowLeftIcon size={16} />
          </button>

          {tagItem && (
            <Slot className="shrink-0">
              <IngredientItem item={tagItem} container="ingredients" />
            </Slot>
          )}

          <div className="min-w-0 flex-1">
            <span className="block truncate text-xs font-medium sm:text-sm" title={expandedTag.id}>
              {expandedTag.id}
            </span>
          </div>

          <button
            type="button"
            className="text-muted-foreground hover:bg-accent hover:text-foreground rounded p-1 transition-colors"
            onClick={() => handleDownloadTag(expandedTag.uid)}
            title="Download tag JSON"
          >
            <DownloadIcon size={14} />
          </button>

          <button
            type="button"
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded p-1 transition-colors"
            onClick={() => handleDeleteTag(expandedTag.uid)}
          >
            <Trash2Icon size={14} />
          </button>
        </div>

        <TagEditor
          tag={expandedTag}
          items={items}
          itemsById={itemsById}
          vanillaTagItems={vanillaTagItems}
          customTagItems={customTagItems}
          vanillaTags={vanillaTags}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      {filteredCustomTags.length > 0 && (
        <span className="text-muted-foreground hidden text-xs font-medium lg:block">
          Custom Tags
        </span>
      )}

      {filteredCustomTags.length > 0 && (
        <div className="flex shrink-0 gap-2 overflow-x-auto pb-1 lg:grid lg:max-h-[33%] lg:grid-cols-2 lg:content-start lg:gap-2 lg:overflow-x-hidden lg:overflow-y-auto lg:pb-0">
          {filteredCustomTags.map((tag) => {
            const tagItem = customTagItems[tag.uid];
            if (!tagItem) return null;

            return (
              <IngredientCard
                key={tag.uid}
                label={tag.id}
                onClick={() => setExpandedTagUid(tag.uid)}
                className="min-w-[180px] items-center lg:min-w-0"
                actions={
                  <>
                    <button
                      type="button"
                      className="text-muted-foreground hover:bg-accent hover:text-foreground rounded p-1 transition-colors"
                      onClick={() => handleDownloadTag(tag.uid)}
                      title="Download tag JSON"
                    >
                      <DownloadIcon size={14} />
                    </button>

                    <button
                      type="button"
                      value={tag.uid}
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded p-1 transition-colors"
                      onClick={(event) => handleDeleteTag(event.currentTarget.value)}
                    >
                      <Trash2Icon size={14} />
                      <span className="sr-only">Delete tag</span>
                    </button>
                  </>
                }
              >
                <IngredientItem item={tagItem} container="ingredients" />
              </IngredientCard>
            );
          })}
        </div>
      )}

      {filteredCustomTags.length > 0 && (
        <span className="text-muted-foreground hidden text-xs font-medium lg:block">
          Vanilla Tags
        </span>
      )}

      <InventoryGridContainer>
        <div className="grid grid-cols-[repeat(auto-fill,36px)] content-start">
          {filteredVanillaTagItems.map((tagItem) => (
            <Slot key={identifierUniqueKey(tagItem.id)}>
              <IngredientItem item={tagItem} container="ingredients" />
            </Slot>
          ))}
        </div>
      </InventoryGridContainer>
    </div>
  );
};
