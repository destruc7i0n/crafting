import { useRef, useState } from "react";

import { ArrowLeftIcon, Trash2Icon } from "lucide-react";

import { NoTextureTexture } from "@/data/constants";
import { CustomItem } from "@/data/models/types";
import { useCustomItemStore } from "@/stores/custom-item";

import { Item } from "../item/item";
import { ItemPreview } from "../item/item-preview";
import { Slot } from "../slot/slot";

export const CustomItemCard = ({
  item,
  isExpanded,
  onToggle,
}: {
  item: CustomItem;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const updateCustomItem = useCustomItemStore((state) => state.updateCustomItem);
  const deleteCustomItem = useCustomItemStore((state) => state.deleteCustomItem);

  const [draftName, setDraftName] = useState(item.displayName);
  const [draftId, setDraftId] = useState(item.id.raw);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const commitChanges = () => {
    const updates: Parameters<typeof updateCustomItem>[1] = {};

    if (draftName !== item.displayName) {
      updates.displayName = draftName;
    }

    if (draftId !== item.id.raw) {
      updates.rawId = draftId;
    }

    if (Object.keys(updates).length > 0) {
      updateCustomItem(item.id.raw, updates);
    }
  };

  const handleEditTextureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        updateCustomItem(item.id.raw, { texture: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isExpanded) {
    return (
      <div className="flex min-w-0 items-start gap-2 rounded-md border border-border bg-muted/50 p-1.5">
        <Slot className="shrink-0">
          <Item item={item} container="ingredients" />
        </Slot>

        <button
          type="button"
          className="flex min-w-0 flex-1 flex-col overflow-hidden pt-0.5 text-left"
          onClick={onToggle}
        >
          <span className="truncate text-sm font-medium">{item.displayName}</span>
          <span className="truncate text-xs text-muted-foreground">{item.id.namespace}</span>
        </button>

        <button
          type="button"
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          onClick={() => deleteCustomItem(item.id.raw)}
        >
          <Trash2Icon size={14} />
          <span className="sr-only">Delete item</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          onClick={onToggle}
        >
          <ArrowLeftIcon size={16} />
        </button>

        <Slot className="shrink-0">
          <Item item={item} container="ingredients" />
        </Slot>

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{item.displayName}</div>
          <div className="truncate text-xs text-muted-foreground">{item.id.raw}</div>
        </div>

        <button
          type="button"
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          onClick={() => {
            deleteCustomItem(item.id.raw);
            onToggle();
          }}
        >
          <Trash2Icon size={14} />
          <span className="sr-only">Delete item</span>
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Name
          <input
            value={draftName}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-hidden focus:ring-2 focus:ring-inset focus:ring-ring"
            onBlur={commitChanges}
            onChange={(event) => setDraftName(event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Id
          <input
            value={draftId}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-hidden focus:ring-2 focus:ring-inset focus:ring-ring"
            onBlur={commitChanges}
            onChange={(event) => setDraftId(event.target.value)}
          />
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-foreground">Texture</span>
        <div className="flex items-center gap-2">
          <label className="flex-1 cursor-pointer rounded-md border border-dashed border-border px-3 py-2 text-center text-xs text-muted-foreground transition-colors hover:bg-accent">
            {item.texture !== NoTextureTexture ? "Change texture" : "Select texture (.png)"}
            <input
              ref={editFileInputRef}
              type="file"
              accept=".png"
              className="hidden"
              onChange={handleEditTextureChange}
            />
          </label>

          <Slot width={32} height={32}>
            <ItemPreview alt="Preview" texture={item.texture} />
          </Slot>
        </div>
      </div>
    </div>
  );
};
