import { useRef, useState } from "react";

import { ArrowLeftIcon } from "lucide-react";

import {
  isValidJavaNamespacedIdentifier,
  javaNamespacedIdentifierHint,
} from "@/lib/minecraft-identifier";
import { cn } from "@/lib/utils";
import { useCustomItemStore } from "@/stores/custom-item";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";

import { ItemPreview } from "../../item/item-preview";
import { Slot } from "../../slot/slot";

interface AddItemFormProps {
  onClose: () => void;
}

export const AddItemForm = ({ onClose }: AddItemFormProps) => {
  const minecraftVersion = useSettingsStore(selectMinecraftVersion);
  const addCustomItem = useCustomItemStore((state) => state.addCustomItem);

  const [name, setName] = useState("");
  const [itemId, setItemId] = useState("");
  const [texture, setTexture] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setTexture(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = () => {
    if (!name.trim() || !isValidJavaNamespacedIdentifier(itemId)) return;

    addCustomItem(name, itemId, texture, minecraftVersion);
    setName("");
    setItemId("");
    setTexture("");
    onClose();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const showItemIdError = itemId.trim().length > 0 && !isValidJavaNamespacedIdentifier(itemId);
  const canAdd = name.trim().length > 0 && isValidJavaNamespacedIdentifier(itemId);

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="text-muted-foreground hover:bg-accent hover:text-foreground rounded p-1 transition-colors"
          onClick={onClose}
        >
          <ArrowLeftIcon size={16} />
        </button>
        <span className="text-sm font-medium">New Item</span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-muted-foreground flex flex-col gap-1 text-xs">
          Name
          <input
            type="text"
            placeholder="Display name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-input bg-background text-foreground focus:ring-ring rounded-md border px-3 py-2 text-sm outline-hidden focus:ring-2 focus:ring-inset"
          />
        </label>
        <label className="text-muted-foreground flex flex-col gap-1 text-xs">
          Id
          <input
            type="text"
            placeholder="namespace:item"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={showItemIdError}
            className={cn(
              "border-input bg-background text-foreground focus:ring-ring rounded-md border px-3 py-2 text-sm outline-hidden focus:ring-2 focus:ring-inset",
              showItemIdError && "border-destructive focus:ring-destructive",
            )}
          />
          {showItemIdError && (
            <span className="text-destructive text-[10px]">{javaNamespacedIdentifierHint}</span>
          )}
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-foreground text-xs font-medium">Texture</span>
        <div className="flex items-center gap-2">
          <label className="border-border text-muted-foreground hover:bg-accent flex-1 cursor-pointer rounded-md border border-dashed px-3 py-2 text-center text-xs transition-colors">
            {texture ? "Change texture" : "Select texture (.png)"}
            <input
              ref={fileInputRef}
              type="file"
              accept=".png"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {texture && (
            <Slot width={32} height={32}>
              <ItemPreview alt="Preview" texture={texture} />
            </Slot>
          )}
        </div>
      </div>

      <button
        type="button"
        disabled={!canAdd}
        onClick={handleAdd}
        className="border-border text-foreground hover:bg-accent rounded-md border px-3 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        Create Item
      </button>

      <p className="text-foreground/70 text-xs leading-relaxed">
        Custom items are placeholders used in generated recipes and tags. They are not added to
        Minecraft.
      </p>
    </div>
  );
};
