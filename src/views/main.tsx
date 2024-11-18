import { RecipeTypeSelector } from "@/components/fields/recipe-type-selector";
import { ItemOutput } from "@/components/output/item-output";
import { Preview } from "@/components/preview/preview";

export const Main = () => {
  return (
    <>
      <div className="mb-4 flex flex-col items-center gap-4">
        <RecipeTypeSelector />
        <Preview />
      </div>
      <ItemOutput />
    </>
  );
};
