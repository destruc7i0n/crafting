import { Analytics } from "./components/analytics";
import { Layout } from "./components/layout/layout";
import { ThemeProvider } from "./context/theme-context";
import { useDndMonitor } from "./hooks/use-dnd-monitor";
import { Main } from "./views/main";

function App() {
  useDndMonitor();

  return (
    <ThemeProvider defaultTheme="system">
      <Analytics />
      <Layout>
        <Main />
      </Layout>
    </ThemeProvider>
  );
}

export default App;
