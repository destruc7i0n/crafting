import path from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    target: "es2020",
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      spa: {
        enabled: true,
      },
      sitemap: {
        enabled: false,
      },
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(projectRoot, "./src"),
    },
  },
  ssr: {
    noExternal: ["@atlaskit/pragmatic-drag-and-drop", "@nozbe/microfuzz"],
  },
  css: {
    modules: {
      localsConvention: "camelCaseOnly",
    },
  },
  test: {
    globals: true,
    // environment: "jsdom", // for ui testing
    // setupFiles: "src/setupTests", // for ui testing
    mockReset: true,
  },
});
