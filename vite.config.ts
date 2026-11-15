import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
export default defineConfig({
  plugins: [
    tailwindcss(),
    tanstackStart({ server: { entry: "server" } }),
    nitro({
      preset: process.env["VERCEL"] ? "vercel" : "node-server",
      vercel: {
        functions: { maxDuration: Number(process.env["VERCEL_FUNCTION_MAX_DURATION"] || 300) },
      },
    }),
    react(),
  ],
  resolve: { tsconfigPaths: true, dedupe: ["react", "react-dom", "@tanstack/react-query"] },
  server: { host: "127.0.0.1", port: 8081 },
});
