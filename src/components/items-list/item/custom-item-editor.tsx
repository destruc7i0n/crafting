import { useRef, useState } from "react";

import { ArrowLeftIcon, Trash2Icon } from "lucide-react";

import { NoTextureTexture } from "@/data/constants";
import { getFullId, getRawId } from "@/data/models/identifier/utilities";
import { CustomItem } from "@/data/models/types";
import { deleteCustomItemAndClearRecipeRefs } from "@/lib/editor-actions";
import {
  bedrockIdentifierHint,
  isValidNamespacedIdentifier,
  javaNamespacedIdentifierHint,
} from "@/lib/minecraft-identifier";
import { cn } from "@/lib/utils";
import { useCustomItemStore } from "@/stores/custom-item";

import { Item } from "../../item/item";
import { ItemPreview } from "../../item/item-preview";
import { Slot } from "../../slot/slot";
import { IngredientCard } from "../ingredient-card";

export const CustomItemEditor = ({
  item,
  isExpanded,
  onToggle,
  className,
}: {
  item: CustomItem;
  isExpanded: boolean;
  onToggle: () => void;
  className?: string;
}) => {
  const updateCustomItem = useCustomItemStore((state) => state.updateCustomItem);

  const [draftName, setDraftName] = useState(item.displayName);
  const [draftId, setDraftId] = useState(getRawId(item.id));
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const showDraftIdError =
    draftId.trim().length === 0 || !isValidNamespacedIdentifier(draftId, item._version);
  const identifierHint =
    item._version === "bedrock"
      ? `Use namespace:name (${bedrockIdentifierHint})`
      : javaNamespacedIdentifierHint;

  const commitChanges = () => {
    const updates: Parameters<typeof updateCustomItem>[1] = {};

    if (draftName !== item.displayName) {
      updates.displayName = draftName;
    }

    if (!showDraftIdError && draftId !== getRawId(item.id)) {
      updates.rawId = draftId;
    }

    if (Object.keys(updates).length > 0) {
      updateCustomItem(item.uid, updates);
    }
  };

  const handleEditTextureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        updateCustomItem(item.uid, { texture: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isExpanded) {
    const id = getFullId(item.id);
    return (
      <IngredientCard
        label={item.displayName}
        sublabel={id}
        onClick={onToggle}
        className={className}
        actions={
          <button
            type="button"
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer rounded p-1 transition-colors"
            onClick={() => deleteCustomItemAndClearRecipeRefs(item.uid)}
          >
            <Trash2Icon size={14} />
            <span className="sr-only">Delete item</span>
          </button>
        }
      >
        <Item item={item} />
      </IngredientCard>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer rounded p-1 transition-colors"
          onClick={onToggle}
        >
          <ArrowLeftIcon size={16} />
        </button>

        <Slot className="shrink-0">
          <Item item={item} />
        </Slot>

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{item.displayName}</div>
          <div className="text-muted-foreground truncate text-xs">{getFullId(item.id)}</div>
        </div>

        <button
          type="button"
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer rounded p-1 transition-colors"
          onClick={() => {
            deleteCustomItemAndClearRecipeRefs(item.uid);
            onToggle();
          }}
        >
          <Trash2Icon size={14} />
          <span className="sr-only">Delete item</span>
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-muted-foreground flex flex-col gap-1 text-xs">
          Display Name
          <input
            value={draftName}
            className="border-input bg-background text-foreground focus:ring-ring rounded-md border px-3 py-2 text-sm outline-hidden focus:ring-2 focus:ring-inset"
            onBlur={commitChanges}
            onChange={(event) => setDraftName(event.target.value)}
          />
        </label>
        <label className="text-muted-foreground flex flex-col gap-1 text-xs">
          Id
          <input
            value={draftId}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={showDraftIdError}
            className={cn(
              "border-input bg-background text-foreground focus:ring-ring rounded-md border px-3 py-2 text-sm outline-hidden focus:ring-2 focus:ring-inset",
              showDraftIdError && "border-destructive focus:ring-destructive",
            )}
            onBlur={commitChanges}
            onChange={(event) => setDraftId(event.target.value)}
          />
          {showDraftIdError && (
            <span className="text-destructive text-[10px]">{identifierHint}</span>
          )}
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-foreground text-xs font-medium">Texture</span>
        <div className="flex items-center gap-2">
          <label className="border-border text-muted-foreground hover:bg-accent flex-1 cursor-pointer rounded-md border border-dashed px-3 py-2 text-center text-xs transition-colors">
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

      <p className="text-foreground/70 text-xs leading-relaxed">
        Custom items are placeholders used in generated recipes and tags. They are not added to
        Minecraft.
      </p>
    </div>
  );
};
