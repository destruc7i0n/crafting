import { Layout } from "./components/layout/layout";
import { useDndMonitor } from "./hooks/use-dnd-monitor";
import { useMinecraftTexturesData } from "./hooks/use-minecraft-textures-data";
import { Index } from "./views/index";

function App() {
  useMinecraftTexturesData();
  useDndMonitor();

  return (
    <Layout>
      <Index />
    </Layout>
  );
}

export default App;
