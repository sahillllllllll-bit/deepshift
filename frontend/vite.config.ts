import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(async () => {
  const plugins: any[] = [react()];

  // Dynamically load replit plugins to avoid ESM/CJS interop issues
  try {
    // runtime error overlay is ESM-only; import dynamically
    const runtime = await import("@replit/vite-plugin-runtime-error-modal");
    if (runtime && typeof runtime.default === "function") {
      plugins.push(runtime.default());
    }
  } catch (err) {
    // ignore if plugin not available in this environment
  }

  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
    try {
      const carto = await import("@replit/vite-plugin-cartographer");
      const banner = await import("@replit/vite-plugin-dev-banner");
      if (carto && typeof carto.cartographer === "function") plugins.push(carto.cartographer());
      if (banner && typeof banner.devBanner === "function") plugins.push(banner.devBanner());
    } catch (err) {
      // ignore optional repl plugins
    }
  }

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
        "@shared": path.resolve(import.meta.dirname, "src/shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    root: path.resolve(import.meta.dirname, "."),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist"),
      emptyOutDir: true,
    },
    server: {
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
      proxy: {
        // Proxy API requests to backend during development
        "/api": {
          target: process.env.VITE_API_URL || "http://localhost:5000",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
        },
      },
    },
  };
});
