import type { Config } from "@react-router/dev/config";

export default {
  ssr: false,
  basename: "/",
  buildDirectory: "build",
  prerender: false, // Add this line
} satisfies Config;