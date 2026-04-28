import { RecipeTypeSelector } from "@/components/fields/recipe-type-selector";
import { CreatorLayout } from "@/components/layout/creator-layout";
import { RecipeOptions } from "@/components/options/recipe-options";
import { ItemOutput } from "@/components/output/item-output";
import { Preview } from "@/components/preview/preview";
import { MobileRecipeSwitcher } from "@/components/recipes/sidebar/mobile-recipe-switcher";
import { useDndMonitor } from "@/hooks/use-dnd-monitor";

export function CreatorView() {
  useDndMonitor();

  return (
    <CreatorLayout>
      <div className="flex flex-col gap-2 lg:h-full lg:min-h-0 lg:gap-4">
        <MobileRecipeSwitcher />

        <div className="bg-card rounded-lg border p-4">
          <div className="flex flex-col items-center gap-2">
            <RecipeTypeSelector />
            <Preview />
          </div>
        </div>

        <div className="bg-card rounded-lg border">
          <RecipeOptions />
        </div>

        <div className="lg:flex lg:min-h-0 lg:flex-col">
          <ItemOutput />
        </div>
      </div>
    </CreatorLayout>
  );
}
