import { useState } from "react";

import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useRecipeStore } from "@/stores/recipe";

import { AdvancedOptions } from "./recipe-options/advanced-options";
import { BedrockOptions } from "./recipe-options/bedrock-options";
import { CookingOptions } from "./recipe-options/cooking-options";
import { CraftingOptions } from "./recipe-options/crafting-options";
import { DatapackOptions } from "./recipe-options/datapack-options";

export const RecipeOptions = () => {
  const hasRecipe = useRecipeStore((state) => state.recipes[state.selectedRecipeIndex] != null);
  const selectedRecipeIndex = useRecipeStore((state) => state.selectedRecipeIndex);
  const [optionsOpen, setOptionsOpen] = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  if (!hasRecipe) {
    return null;
  }

  return (
    <div className="flex flex-col">
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1 px-4 py-3 text-sm font-medium transition-colors"
        onClick={() => setOptionsOpen((value) => !value)}
      >
        <ChevronDownIcon
          size={14}
          className={cn("transition-transform", !optionsOpen && "-rotate-90")}
        />
        Options
      </button>

      {optionsOpen && (
        <div
          key={selectedRecipeIndex} // remounts the subtree on recipe switch
          className="flex flex-col gap-3 border-t px-4 py-3"
        >
          <CraftingOptions />
          <CookingOptions />
          <DatapackOptions />
          <AdvancedOptions
            open={advancedOpen}
            onToggle={() => setAdvancedOpen((value) => !value)}
          />
          <BedrockOptions />
        </div>
      )}
    </div>
  );
};
