import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: "/elbasha/",
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths()
  ],
  ssr: {
    noExternal: ['styled-components', 'ldrs'],
  },
  // REMOVED the broken resolve.alias for styled-components
}); 