import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: { alias: { "react-native-svg": fileURLToPath(new URL("./src/rnsvg.tsx", import.meta.url)) } },
  build: { outDir: "docs", emptyOutDir: true },
});
