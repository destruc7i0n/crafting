import { useLayoutEffect, useRef } from "react";

import { ResourceIcon } from "@/components/item/resource-icon";
import { recipeTypeToItemId, recipeTypeToName } from "@/data/constants";
import { getSupportedRecipeTypesForVersion } from "@/data/versions";
import { cn } from "@/lib/utils";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipeType } from "@/stores/recipe/selectors";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";

export const RecipeTypeSelector = () => {
  const minecraftVersion = useSettingsStore(selectMinecraftVersion);
  const recipeType = useRecipeStore(selectCurrentRecipeType);
  const setRecipeType = useRecipeStore((state) => state.setRecipeType);
  const scrollRef = useRef<HTMLDivElement>(null);

  const supportedRecipeTypes = getSupportedRecipeTypesForVersion(minecraftVersion);

  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const selected = container.querySelector("[data-selected]") as HTMLElement | null;
    selected?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [recipeType]);

  return (
    <div ref={scrollRef} className="flex w-full gap-1.5 overflow-x-auto pb-2">
      {supportedRecipeTypes.map((type) => {
        const isSelected = recipeType === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => setRecipeType(type)}
            {...(isSelected ? { "data-selected": true } : {})}
            className={cn(
              "flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1.5 transition-all",
              isSelected
                ? "border-primary bg-primary/10 text-foreground"
                : "hover:bg-accent active:bg-accent/80 border-transparent",
            )}
          >
            <ResourceIcon
              itemId={recipeTypeToItemId[type]!}
              alt={recipeTypeToName[type]}
              className="pointer-events-none h-6 w-6"
              draggable={false}
            />
            <span className="text-sm font-medium">{recipeTypeToName[type]}</span>
          </button>
        );
      })}
    </div>
  );
};
