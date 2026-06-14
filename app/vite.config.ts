import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Served from https://rohin999.github.io/sweepstake-shawty/ in production, so
// assets need the "/sweepstake-shawty/" base. Local dev stays at root.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/sweepstake-shawty/" : "/",
  plugins: [react(), tailwindcss()],
}));
