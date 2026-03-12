import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    ...(command === "serve" ? [basicSsl()] : []),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      workbox: {
        // Precache JS, CSS, HTML, fonts
        globPatterns: ["**/*.{js,css,html,woff,woff2}"],
        // Don't precache adhan audio (11MB) — cache on first play instead
        globIgnores: ["**/audio/**"],
        runtimeCaching: [
          {
            // Cache adhan audio files on first play
            urlPattern: /\/audio\/adhan\/.*\.mp3$/,
            handler: "CacheFirst",
            options: {
              cacheName: "adhan-audio",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Network-only for OpenStreetMap geocoding
            urlPattern: /nominatim\.openstreetmap\.org/,
            handler: "NetworkOnly",
          },
        ],
      },
      manifest: {
        name: "Islamic Prayer Times & Fasting Schedule",
        short_name: "Prayer Times",
        description:
          "Accurate prayer times, Qibla direction, Hijri calendar, fasting schedule, and duas",
        theme_color: "#166534",
        background_color: "#f5f0e8",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          prayer: ["adhan", "hijri-converter"],
          ui: ["lucide-react", "date-fns"],
        },
      },
    },
  },
}));
