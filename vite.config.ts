import { reactRouter } from "@react-router/dev/vite";
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
    noExternal: ['styled-components', 'ldrs'],
  },
  resolve: {
    alias: {
      'styled-components': 'styled-components/dist/styled-components.browser.esm.js'
    }
  }
});