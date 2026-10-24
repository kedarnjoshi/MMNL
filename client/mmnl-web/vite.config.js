import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Same-origin in production (reverse proxy). In dev, forward backend paths to Spring Boot.
const backend = "http://localhost:8080";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": backend,
      "/oauth2": backend,
      "/login/oauth2": backend,
      "/logout": backend,
    },
  },
});
