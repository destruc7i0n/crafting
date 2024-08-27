import { Layout } from "./components/layout/layout";
import { useMinecraftTexturesData } from "./hooks/use-minecraft-textures-data";
import { usePreviewDndHandler } from "./hooks/use-preview-dnd-handler";
import { Main } from "./views/main";

function App() {
  useMinecraftTexturesData();
  usePreviewDndHandler();

  return (
    <Layout>
      <Main />
    </Layout>
  );
}

export default App;
