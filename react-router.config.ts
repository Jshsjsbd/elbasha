import type { Config } from "@react-router/dev/config";

export default {
  ssr: false,
  basename: "/elbasha",  // Changed: GitHub Pages serves from /elbasha/
  buildDirectory: "build",
} satisfies Config;