import { Layout } from "./components/layout/layout";
import { Output } from "./components/output/output";
import { Ingredients } from "./components/preview/ingredients";
import { MinecraftUIPreview } from "./components/preview/minecraft-ui-preview";
import { RecipeType } from "./data/types";
import { useMinecraftTexturesData } from "./hooks/use-minecraft-textures-data";
import { usePreviewDndHandler } from "./hooks/use-preview-dnd-handler";
import { useRecipeStore } from "./stores/recipe";
import { selectCurrentRecipeType } from "./stores/recipe/selectors";

function App() {
  useMinecraftTexturesData();
  usePreviewDndHandler();

  return (
    <Layout>
      <div className="mx-auto flex max-w-screen-lg flex-row">
        <div className="flex-1">
          <MinecraftUIPreview />
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
