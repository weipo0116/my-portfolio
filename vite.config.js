import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/my-portfolio/", // 這裡一定要改！前後都要有斜線
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        links: resolve(__dirname, "links/index.html"), // → /my-portfolio/links/
      },
    },
  },
});
