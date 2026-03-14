import { RecipeTypeSelector } from "@/components/fields/recipe-type-selector";
import { RecipeOptions } from "@/components/options/recipe-options";
import { ItemOutput } from "@/components/output/item-output";
import { Preview } from "@/components/preview/preview";

export const Main = () => {
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border bg-card p-4">
        <div className="flex flex-col items-center gap-4">
          <RecipeTypeSelector />
          <Preview />
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <RecipeOptions />
      </div>

      <ItemOutput />
    </div>
  );
};
