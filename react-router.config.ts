import type { Config } from "@react-router/dev/config";
import { vercelPreset } from "@react-router/dev/presets/vercel";

export default {
  presets: [vercelPreset()],
  ssr: true,
  basename: "/",
  buildDirectory: "build",
} satisfies Config;