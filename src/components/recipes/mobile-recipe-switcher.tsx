import { ChevronRightIcon } from "lucide-react";

import { ResourceIcon } from "@/components/item/resource-icon";
import { useResolvedRecipeNames } from "@/hooks/use-resolved-recipe-names";
import { getRecipeTypeIconItemId } from "@/recipes/definitions";
import { getRecipeExportDetail } from "@/recipes/naming";
import { useRecipeStore } from "@/stores/recipe";
import { selectCurrentRecipe } from "@/stores/recipe/selectors";
import { useSettingsStore } from "@/stores/settings";
import { selectMinecraftVersion } from "@/stores/settings/selectors";
import { useUIStore } from "@/stores/ui";

export const MobileRecipeSwitcher = () => {
  const recipes = useRecipeStore((state) => state.recipes);
  const currentRecipe = useRecipeStore(selectCurrentRecipe);
  const resolvedNames = useResolvedRecipeNames();
  const minecraftVersion = useSettingsStore(selectMinecraftVersion);
  const setMobileRecipeSidebarOpen = useUIStore((state) => state.setMobileRecipeSidebarOpen);

  // the recipe store should always have a valid selected recipe
  if (!currentRecipe) return null;

  const naming = resolvedNames.byId[currentRecipe.id];
  const sidebarTitle = naming?.sidebarTitle ?? "Recipe";
  const detail = getRecipeExportDetail(naming, minecraftVersion);

  return (
    <button
      type="button"
      onClick={() => setMobileRecipeSidebarOpen(true)}
      className="bg-card text-foreground hover:bg-accent active:bg-accent/80 flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors lg:hidden"
    >
      <ResourceIcon
        itemId={getRecipeTypeIconItemId(currentRecipe.recipeType)}
        className="h-8 w-8 shrink-0"
      />

      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-semibold">{sidebarTitle}</span>
        <span className="text-muted-foreground truncate text-xs">
          {detail} · {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}
        </span>
      </span>

      <ChevronRightIcon size={16} className="text-muted-foreground shrink-0" />
    </button>
  );
};
