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
        work: resolve(__dirname, "work/index.html"), // → /my-portfolio/work/
        links: resolve(__dirname, "links/index.html"), // → /my-portfolio/links/
        labAstro: resolve(__dirname, "lab/astro/index.html"), // → /my-portfolio/lab/astro/
        labOutfit: resolve(__dirname, "lab/outfit/index.html"), // → /my-portfolio/lab/outfit/
        labWeekend: resolve(__dirname, "lab/weekend/index.html"), // → /my-portfolio/lab/weekend/
        labCities: resolve(__dirname, "lab/cities/index.html"), // → /my-portfolio/lab/cities/
        labRoom: resolve(__dirname, "lab/room/index.html"), // → /my-portfolio/lab/room/
      },
    },
  },
});
