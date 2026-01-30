import type { Config } from "@react-router/dev/config";

export default {
  ssr: false,
  basename: "/elbasha",
  buildDirectory: "build",
  prerender: ["/"],
} satisfies Config;