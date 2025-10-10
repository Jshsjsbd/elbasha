import { reactRouter } from "@react-router/dev/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tailwindcss(), 
    reactRouter(), 
    tsconfigPaths()
  ],
  ssr: {
    noExternal: ['styled-components'] // This helps with SSR for styled-components
  }
});