import { Layout } from "./components/layout/layout";
import { useDndMonitor } from "./hooks/use-dnd-monitor";
import { Index } from "./views/index";

function App() {
  useDndMonitor();

  return (
    <Layout>
      <Index />
    </Layout>
  );
}

export default App;
