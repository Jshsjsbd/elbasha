import type { Config } from "@react-router/dev/config";

export default {
  // SSR is disabled for SPA behavior, but we provide custom HTML rendering
  ssr: false,
  basename: "/",
} satisfies Config;
