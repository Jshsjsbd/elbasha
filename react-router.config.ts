import type { Config } from "@react-router/dev/config";

export default {
  ssr: false,
  basename: "/",
  buildDirectory: "build",
  future: {
    unstable_singleFetch: true,
  },
} satisfies Config;