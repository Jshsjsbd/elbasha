import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("store", "routes/store.tsx"),
  route("success", "routes/success.tsx"),
  route("cancel", "routes/cancel.tsx"),
  route("applications", "routes/applications.tsx"),
  route("applications/:type", "routes/applications.$type.tsx"),
  route("auth/discord/callback", "routes/auth.discord.callback.tsx"),
  route("profile", "routes/profile.tsx"),
  
  // API Routes
  route("api/auth/discord-callback", "api/auth.ts"),
  route("api/server/status", "api/server-status.ts"),
  route("api/applications", "api/applications.ts"),
] satisfies RouteConfig;

