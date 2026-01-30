import type { Config } from "@react-router/dev/config";

export default {
  ssr: false,  // SPA mode for static hosting
  basename: "/elbasha",
  buildDirectory: "build",
  prerender: ["/"],  // This generates index.html
} satisfies Config;