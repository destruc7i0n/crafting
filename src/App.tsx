import { RouterProvider } from "@tanstack/react-router";

import { Analytics } from "./components/analytics";
import { ThemeProvider } from "./context/theme-context";
import { router } from "./router";

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <Analytics />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
