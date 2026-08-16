import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import { VitePWA } from "vite-plugin-pwa";

// PREVIEW_SINGLEFILE=1 produces a fully self-contained index.html (all JS,
// CSS, fonts, and generated inline data embedded) for sharing as a preview
// where no static file server is available. Normal builds get the PWA
// service worker for installability and offline use instead.
const singlefile = process.env.PREVIEW_SINGLEFILE === "1";

export default defineConfig({
  plugins: [
    react(),
    ...(singlefile
      ? [viteSingleFile()]
      : [
          VitePWA({
            registerType: "autoUpdate",
            includeAssets: ["favicon.svg"],
            manifest: {
              name: "SAF Drill Coach",
              short_name: "Drill Coach",
              description:
                "Drill reference and session runner sourced verbatim from the SAF Drill Manual.",
              theme_color: "#2e4b33",
              background_color: "#fcfcfa",
              display: "standalone",
              orientation: "portrait",
              icons: [
                {
                  src: "favicon.svg",
                  sizes: "any",
                  type: "image/svg+xml",
                  purpose: "any",
                },
              ],
            },
            workbox: {
              globPatterns: ["**/*.{js,css,html,svg,woff2}"],
              runtimeCaching: [
                {
                  urlPattern: /\/content\/.*\.json$/,
                  handler: "StaleWhileRevalidate",
                  options: { cacheName: "content" },
                },
                {
                  urlPattern: /\/media\/figures\/.*/,
                  handler: "CacheFirst",
                  options: {
                    cacheName: "figures",
                    expiration: { maxEntries: 200 },
                  },
                },
                {
                  urlPattern: /\/media\/videos\/.*/,
                  handler: "CacheFirst",
                  options: {
                    cacheName: "videos",
                    expiration: { maxEntries: 20 },
                    rangeRequests: true,
                  },
                },
              ],
            },
          }),
        ]),
  ],
  build: singlefile
    ? { assetsInlineLimit: 1_000_000_000, chunkSizeWarningLimit: 100_000 }
    : undefined,
  define: {
    "import.meta.env.VITE_SINGLEFILE": JSON.stringify(singlefile ? "1" : "0"),
  },
});
