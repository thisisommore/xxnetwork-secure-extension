import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import webExtension from "vite-plugin-web-extension";
import path from "path";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte(), 
    webExtension(),
  ],
  resolve: {
    alias: {
      $lib: path.resolve('./src/lib')
    }
  }
});
