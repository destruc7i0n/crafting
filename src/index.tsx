import React from "react";

import ReactDOM from "react-dom/client";

import App from "./App.tsx";
import { ThemeProvider } from "./context/theme-context";

import "./assets/css/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system">
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
