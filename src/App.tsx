import { useEffect } from "react";

import { Layout } from "./components/layout/layout";
import { Output } from "./components/output";
import { Ingredients } from "./components/preview/ingredients";
import { CraftingGrid } from "./components/preview/minecraft/crafting-grid";
import { MinecraftVersion } from "./data/types";
import { usePreviewDndHandler } from "./hooks/use-preview-dnd-handler";
import { useAppDispatch } from "./store/hooks";
import { fetchResources } from "./store/slices/resourcesSlice";

function App() {
  usePreviewDndHandler();

  const dispatch = useAppDispatch();
  useEffect(() => {
    console.log("fetching resources");
    dispatch(fetchResources(MinecraftVersion.V120));
  }, [dispatch]);

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
