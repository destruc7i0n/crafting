import { useRef, useState } from "react";

import { ArrowLeftIcon } from "lucide-react";

import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";
import { useCustomItemStore } from "@/stores/custom-item";
import { useUIStore } from "@/stores/ui";

import { ItemPreview } from "../item/item-preview";
import { Slot } from "../slot/slot";

export const AddItemForm = () => {
  const minecraftVersion = useSettingsStore(selectMinecraftVersion);
  const addCustomItem = useCustomItemStore((state) => state.addCustomItem);
  const toggleShowForm = useUIStore((state) => state.toggleAddItemForm);

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
    if (!name || !itemId) return;

    addCustomItem(name, itemId, texture, minecraftVersion);
    setName("");
    setItemId("");
    setTexture("");
    toggleShowForm();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const canAdd = name.trim().length > 0 && itemId.trim().length > 0;

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          onClick={toggleShowForm}
        >
          <ArrowLeftIcon size={16} />
        </button>
        <span className="text-sm font-medium">New Item</span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Name
          <input
            type="text"
            placeholder="Display name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-inset focus:ring-ring"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Id
          <input
            type="text"
            placeholder="namespace:item"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-inset focus:ring-ring"
          />
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-foreground">Texture</span>
        <div className="flex items-center gap-2">
          <label className="flex-1 cursor-pointer rounded-md border border-dashed border-border px-3 py-2 text-center text-xs text-muted-foreground transition-colors hover:bg-accent">
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
        className="rounded-md border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        Create Item
      </button>
    </div>
  );
};
