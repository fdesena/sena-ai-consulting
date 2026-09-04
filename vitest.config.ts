import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Separate from vite.config.ts, which is owned by the Lovable wrapper
// (@lovable.dev/vite-tanstack-config) and can't be extended with `test`.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
});
