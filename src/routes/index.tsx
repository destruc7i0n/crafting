import { RecipeTypeSelector } from "@/components/fields/recipe-type-selector";
import { ItemsList } from "@/components/items-list/items-list";
import { Output } from "@/components/output/output";
import { Preview } from "@/components/preview/preview";
import { Topbar } from "@/components/topbar/topbar";
import { useMinecraftTexturesData } from "@/hooks/use-minecraft-textures-data";
import { usePreviewDndHandler } from "@/hooks/use-preview-dnd-handler";

export const Index = () => {
  useMinecraftTexturesData();
  usePreviewDndHandler();

  return (
    <div className="mx-auto grid h-full w-full max-w-screen-lg grid-cols-1 gap-4 p-4 [grid-template-areas:'topbar''left''items'] lg:grid-cols-2 lg:grid-rows-[auto_minmax(0,1fr)] lg:[grid-template-areas:'topbar_topbar''left_items''left_items']">
      <div className="[grid-area:topbar]">
        <Topbar />
      </div>
      <div className="[grid-area:left]">
        <div className="mb-4 flex flex-col items-center gap-4">
          <RecipeTypeSelector />
          <Preview />
        </div>
        <Output />
      </div>
      <div className="flex [grid-area:items]">
        <ItemsList />
      </div>
    </div>
  );
};
