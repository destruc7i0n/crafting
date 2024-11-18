import { useState } from "react";

import { ArrowLeft } from "lucide-react";

import { Slot } from "@/components/slot/slot";
import { TagDropTarget } from "@/components/tag/tag-drop-target";
import { TagItem } from "@/components/tag/tag-item";
import { MinecraftIdentifier } from "@/data/models/types";
import { useTagStore } from "@/stores/tag";
import { selectCurrentTag } from "@/stores/tag/selectors";
import { useUIStore } from "@/stores/ui";

export const TagCreation = () => {
  const setCurrentView = useUIStore((state) => state.setCurrentView);

  const [tagName, setTagName] = useState("");
  const currentTag = useTagStore(selectCurrentTag);
  const removeValueFromTag = useTagStore((state) => state.removeValueFromTag);

  const handleRemoveItem = (id: MinecraftIdentifier) => {
    removeValueFromTag({
      type: "item",
      id,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button onClick={() => setCurrentView("main")} className="p-2">
          <ArrowLeft />
        </button>
        <h2 className="text-2xl font-bold">Create New Tag</h2>
      </div>
      <input
        type="text"
        value={tagName}
        onChange={(e) => setTagName(e.target.value)}
        placeholder="Enter tag name"
        className="rounded border p-2"
      />
      <div className="flex flex-col items-center gap-4">
        <TagDropTarget />
        <div className="w-full">
          <span className="font-minecraft">Items in tag:</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {currentTag?.values.map((value, index) => (
              <Slot key={index} onClick={() => handleRemoveItem(value.id)}>
                <TagItem id={value.id} />
              </Slot>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
