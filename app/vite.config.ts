import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// PREVIEW_SINGLEFILE=1 produces a fully self-contained index.html (all JS,
// CSS, fonts, and generated inline data embedded) for sharing as a preview
// where no static file server is available.
const singlefile = process.env.PREVIEW_SINGLEFILE === "1";

export default defineConfig({
  plugins: [react(), ...(singlefile ? [viteSingleFile()] : [])],
  build: singlefile
    ? { assetsInlineLimit: 1_000_000_000, chunkSizeWarningLimit: 100_000 }
    : undefined,
  define: {
    "import.meta.env.VITE_SINGLEFILE": JSON.stringify(singlefile ? "1" : "0"),
  },
});
