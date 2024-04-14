import { RecipeTypeSelector } from "./components/fields/recipe-type-selector";
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
      <div className="flex w-full flex-col">
        <Output />
      </div>
      <div className="flex w-full flex-col items-center gap-4">
        <div className="flex w-full flex-col items-center gap-4 rounded-md border p-4 shadow">
          <RecipeTypeSelector />
          <Preview />
        </div>
        <ItemsList />
      </div>
    </Layout>
  );
}

export default App;
