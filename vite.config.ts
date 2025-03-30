import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import webExtension from "vite-plugin-web-extension";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    webExtension({
      manifest: "./manifest.json",
      assets: "public",
      webExtConfig: {
        background: {
          entry: "service-worker.ts",
        },
        content: {
          scripts: {
            entries: {
              contentScript: "src/content-script.ts",
            },
          },
        },
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        "service-worker": "service-worker.ts",
      },
    },
  },
})