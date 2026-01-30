import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,  // Changed to true
  basename: "/elbasha",
  buildDirectory: "build",
} satisfies Config;