import { useMemo, type MouseEvent } from "react";

import { ArrowLeftIcon, DownloadIcon, Trash2Icon } from "lucide-react";

import { downloadBlob } from "@/data/datapack";
import { generateTag } from "@/data/generate/tag";
import { Item } from "@/data/models/types";
import { useResourcesForVersion } from "@/hooks/use-resources-for-version";
import { createTagItem, getCustomTagIdentifier, getTagLabel, resolveTagValues } from "@/lib/tags";
import { useTagStore } from "@/stores/tag";

import { Item as IngredientItem } from "../../item/item";
import { Slot } from "../../slot/slot";
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
              rawId: identifier.raw,
              displayName: getTagLabel(identifier.raw),
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
        const rawId = getCustomTagIdentifier(tag).raw;
        return [tag.name, tag.namespace, rawId].some((value) =>
          value.toLowerCase().includes(normalizedSearch),
        );
      }),
    [normalizedSearch, tags],
  );

  const filteredVanillaTagItems = useMemo(
    () =>
      vanillaTagItems.filter((tagItem) => {
        if (!normalizedSearch) return true;
        return tagItem.id.raw.toLowerCase().includes(normalizedSearch);
      }),
    [normalizedSearch, vanillaTagItems],
  );

  const handleDeleteTag = (tagUid: string) => {
    removeTag(tagUid);
    if (expandedTagUid === tagUid) {
      setExpandedTagUid(null);
    }
  };

  const handleDownloadTag = (event: MouseEvent<HTMLButtonElement>) => {
    const tag = tagsByUid[event.currentTarget.value];
    if (!tag) return;

    const json = generateTag(tag);
    const blob = new Blob([JSON.stringify(json, null, 2)], {
      type: "application/json",
    });
    downloadBlob(blob, `${tag.name}.json`);
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
  const handleDownloadExpandedTag = () => {
    if (!expandedTag) return;

    const json = generateTag(expandedTag);
    const blob = new Blob([JSON.stringify(json, null, 2)], {
      type: "application/json",
    });
    downloadBlob(blob, `${expandedTag.name}.json`);
  };

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
            <div className="truncate text-sm font-medium">{expandedTag.name}</div>
            <div className="text-muted-foreground truncate text-xs">{expandedTag.namespace}</div>
          </div>

          <button
            type="button"
            className="text-muted-foreground hover:bg-accent hover:text-foreground rounded p-1 transition-colors"
            onClick={handleDownloadExpandedTag}
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
              <div
                key={tag.uid}
                className="border-border bg-muted/50 flex min-w-[180px] items-start gap-1.5 rounded-md border p-1 sm:gap-2 sm:p-1.5 lg:min-w-0"
              >
                <Slot className="shrink-0">
                  <IngredientItem item={tagItem} container="ingredients" />
                </Slot>

                <button
                  type="button"
                  value={tag.uid}
                  className="flex min-w-0 flex-1 flex-col overflow-hidden pt-0.5 text-left"
                  onClick={(event) => setExpandedTagUid(event.currentTarget.value)}
                >
                  <span className="truncate text-xs font-medium sm:text-sm">{tag.name}</span>
                  <span className="text-muted-foreground truncate text-[10px] sm:text-xs">
                    {tag.namespace}
                  </span>
                </button>

                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    value={tag.uid}
                    className="text-muted-foreground hover:bg-accent hover:text-foreground rounded p-1 transition-colors"
                    onClick={handleDownloadTag}
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
                </div>
              </div>
            );
          })}
        </div>
      )}

      <span className="text-muted-foreground hidden text-xs font-medium lg:block">
        Vanilla Tags
      </span>

      <InventoryGridContainer>
        <div className="grid grid-cols-[repeat(auto-fill,36px)] content-start">
          {filteredVanillaTagItems.map((tagItem) => (
            <Slot key={tagItem.id.raw}>
              <IngredientItem item={tagItem} container="ingredients" />
            </Slot>
          ))}
        </div>
      </InventoryGridContainer>
    </div>
  );
};
