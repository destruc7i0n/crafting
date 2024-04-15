import { RecipeTypeSelector } from "./components/fields/recipe-type-selector";
import { VersionSelector } from "./components/fields/version-selector";
import { ItemsList } from "./components/items-list/items-list";
import { Layout } from "./components/layout/layout";
import { Output } from "./components/output/output";
import { Preview } from "./components/preview/preview";
import { useMinecraftTexturesData } from "./hooks/use-minecraft-textures-data";
import { usePreviewDndHandler } from "./hooks/use-preview-dnd-handler";

function App() {
  useMinecraftTexturesData();
  usePreviewDndHandler();

  return (
    <Layout>
      <div className="mx-auto grid h-full w-full max-w-screen-lg grid-cols-1 gap-4 overflow-y-hidden p-4 [grid-template-areas:'options''preview''items''left'] lg:grid-cols-2 lg:grid-rows-[auto_auto_minmax(0,1fr)] lg:[grid-template-areas:'options_options''left_preview''left_items']">
        <div className="col-span-2 flex items-center justify-between rounded-md border p-2 [grid-area:options]">
          Test
          <VersionSelector />
        </div>
        <div className="[grid-area:left]">
          <Output />
        </div>
        <div className="flex flex-col items-center gap-2 [grid-area:preview]">
          <RecipeTypeSelector />
          <Preview />
        </div>
        <div className="flex [grid-area:items]">
          <ItemsList />
        </div>
      </div>
    </Layout>
  );
}

export default App;
