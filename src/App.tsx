import { DndContext } from "@dnd-kit/core";

import { Layout } from "./components/layout/layout";
import { IngredientDragOverlay } from "./components/preview/drag-overlay";
import { Ingredients } from "./components/preview/ingredients";
import { CraftingGrid } from "./components/preview/minecraft/crafting-grid";

function App() {
  return (
    <Layout>
      <div className="mx-auto flex max-w-screen-lg flex-row">
        <DndContext>
          <div className="flex-1">
            <CraftingGrid />
          </div>
          <div className="flex-1">
            <Ingredients />
          </div>
          <IngredientDragOverlay />
        </DndContext>
      </div>
    </Layout>
  );
}

export default App;
