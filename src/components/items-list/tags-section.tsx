import { PlusIcon } from "lucide-react";

import { parseStringToMinecraftIdentifier } from "@/data/models/identifier/utilities";
import { useTagStore } from "@/stores/tag";
import { useUIStore } from "@/stores/ui";

import { Slot } from "../slot/slot";

interface TagsSectionProps {
  search: string;
}

export const TagsSection = ({ search: _search }: TagsSectionProps) => {
  const currentView = useUIStore((state) => state.currentView);
  const setCurrentView = useUIStore((state) => state.setCurrentView);
  const addTag = useTagStore((state) => state.addTag);

  const handleCreateTag = () => {
    setCurrentView("tagCreation");
    addTag({
      id: parseStringToMinecraftIdentifier("minecraft:my_tag"),
      values: [],
    });
  };

  if (currentView !== "main") return null;

  return (
    <div className="flex flex-col">
      <span className="sticky top-0 z-10 bg-minecraft-inventory-bg/95 p-2 font-minecraft">
        Tags
      </span>
      <div className="flex w-full flex-wrap p-2 pt-0">
        <Slot onClick={handleCreateTag} className="cursor-pointer select-none">
          <PlusIcon size={32} />
        </Slot>
      </div>
    </div>
  );
};
