import path from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    // environment: "jsdom", // for ui testing
    // setupFiles: "src/setupTests", // for ui testing
    mockReset: true,
  },
});
