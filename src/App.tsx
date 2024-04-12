import { Layout } from "./components/layout/layout";
import { Output } from "./components/output";
import { Ingredients } from "./components/preview/ingredients";
import { CraftingGrid } from "./components/preview/minecraft/crafting-grid";
import { useMinecraftTexturesData } from "./hooks/use-minecraft-textures-data";
import { usePreviewDndHandler } from "./hooks/use-preview-dnd-handler";

function App() {
  useMinecraftTexturesData();
  usePreviewDndHandler();

  return (
    <Layout>
      <div className="mx-auto flex max-w-screen-lg flex-row">
        <div className="flex-1">
          <CraftingGrid />
          <Output />
        </div>
        <div className="flex-1">
          <Ingredients />
        </div>
      </div>
    </Layout>
  );
}

export default App;
