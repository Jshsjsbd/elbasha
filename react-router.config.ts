import type { Config } from "@react-router/dev/config";

export default {
  ssr: true, // Changed from false to true
  basename: "/",
  buildDirectory: "build",
} satisfies Config;