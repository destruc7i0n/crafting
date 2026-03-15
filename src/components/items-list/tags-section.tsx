import { useMemo } from "react";

import { ArrowLeftIcon, DownloadIcon, Trash2Icon } from "lucide-react";

import { downloadBlob } from "@/data/datapack";
import { generateTag } from "@/data/generate/tag";
import { Item } from "@/data/models/types";
import { useResourcesForVersion } from "@/hooks/use-resources-for-version";
import { createTagItem, getCustomTagIdentifier, getTagLabel, resolveTagValues } from "@/lib/tags";
import { useRecipeStore } from "@/stores/recipe";
import { useTagStore } from "@/stores/tag";

import { Item as IngredientItem } from "../item/item";
import { Slot } from "../slot/slot";
import { TagEditor } from "./tag-editor";

interface TagsSectionProps {
  search: string;
  expandedTagUid: string | null;
  setExpandedTagUid: (uid: string | null) => void;
}

const EMPTY_TAGS: Record<string, string[]> = {};
const EMPTY_ITEMS: Item[] = [];

export const TagsSection = ({ search, expandedTagUid, setExpandedTagUid }: TagsSectionProps) => {
  const { resources, version } = useResourcesForVersion();
  const tags = useTagStore((state) => state.tags);
  const removeTag = useTagStore((state) => state.removeTag);
  const removeCustomTagFromSlots = useRecipeStore((state) => state.removeCustomTagFromSlots);

  const vanillaTags = resources?.vanillaTags ?? EMPTY_TAGS;
  const items = resources?.items ?? EMPTY_ITEMS;
  const itemsById = resources?.itemsById;
  const normalizedSearch = search.trim().toLowerCase();

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
              tagUid: tag.uid,
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
    removeCustomTagFromSlots(tagUid);
    if (expandedTagUid === tagUid) {
      setExpandedTagUid(null);
    }
  };

  const expandedTag = tags.find((tag) => tag.uid === expandedTagUid);

  if (expandedTag) {
    const tagItem = customTagItems[expandedTag.uid];

    return (
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-1 lg:p-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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
            {tagItem && (
              <div className="truncate text-xs text-muted-foreground">
                {getTagLabel(tagItem.id.raw)}
              </div>
            )}
          </div>

          <button
            type="button"
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            onClick={() => {
              const json = generateTag(expandedTag);
              const blob = new Blob([JSON.stringify(json, null, 2)], {
                type: "application/json",
              });
              downloadBlob(blob, `${expandedTag.name}.json`);
            }}
            title="Download tag JSON"
          >
            <DownloadIcon size={14} />
          </button>

          <button
            type="button"
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
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
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-1 lg:p-0">
      {filteredCustomTags.length > 0 && (
        <span className="hidden text-xs font-medium text-muted-foreground lg:block">
          Custom Tags
        </span>
      )}

      {filteredCustomTags.length > 0 && (
        <div className="flex flex-col gap-2">
          {filteredCustomTags.map((tag) => {
            const tagItem = customTagItems[tag.uid];
            if (!tagItem) return null;

            return (
              <div
                key={tag.uid}
                className="flex items-center gap-3 rounded-md border border-border bg-muted/50 p-2"
              >
                <Slot className="shrink-0">
                  <IngredientItem item={tagItem} container="ingredients" />
                </Slot>

                <button
                  type="button"
                  className="flex min-w-0 flex-1 flex-col text-left"
                  onClick={() => setExpandedTagUid(tag.uid)}
                >
                  <span className="truncate text-sm font-medium">{tag.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {getTagLabel(tagItem.id.raw)}
                  </span>
                </button>

                <button
                  type="button"
                  className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  onClick={() => {
                    const json = generateTag(tag);
                    const blob = new Blob([JSON.stringify(json, null, 2)], {
                      type: "application/json",
                    });
                    downloadBlob(blob, `${tag.name}.json`);
                  }}
                  title="Download tag JSON"
                >
                  <DownloadIcon size={14} />
                </button>

                <button
                  type="button"
                  className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDeleteTag(tag.uid)}
                >
                  <Trash2Icon size={14} />
                  <span className="sr-only">Delete tag</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      <span className="hidden text-xs font-medium text-muted-foreground lg:block">
        Vanilla Tags
      </span>

      <div className="flex flex-col gap-2">
        {filteredVanillaTagItems.map((tagItem) => (
          <div
            key={tagItem.id.raw}
            className="flex items-center gap-3 rounded-md border border-border bg-muted/50 p-2"
          >
            <Slot className="shrink-0">
              <IngredientItem item={tagItem} container="ingredients" />
            </Slot>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{tagItem.id.id}</div>
              <div className="truncate text-xs text-muted-foreground">
                {getTagLabel(tagItem.id.raw)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
