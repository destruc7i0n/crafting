import { Layout } from "./components/layout/layout";
import { useDndMonitor } from "./hooks/use-dnd-monitor";
import { Main } from "./views/main";

function App() {
  useDndMonitor();

  return (
    <Layout>
      <Main />
    </Layout>
  );
}

export default App;
